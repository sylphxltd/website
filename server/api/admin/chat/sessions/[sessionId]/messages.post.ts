import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, type Firestore, type Timestamp } from 'firebase-admin/firestore';
import type { Message } from 'ai'; // Using the full Message type from 'ai'

// Assuming the request body will be a single Message object
// The response will be the saved Message object, potentially with server-generated fields like createdAt timestamp
interface SaveMessageResponse extends Message {}

export default defineEventHandler(async (event: H3Event): Promise<SaveMessageResponse> => {
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken: DecodedIdToken;
  let adminAuth: Auth;

  const sessionId = event.context.params?.sessionId as string | undefined;
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing sessionId in path' });
  }

  try {
    adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      console.warn(`Forbidden attempt to save message by non-admin user: ${decodedToken.uid} for session ${sessionId}`);
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error verifying admin token for saving message (session ${sessionId}):`, errMessage, error);
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
      throw error;
    }
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
  }

  const adminUid = decodedToken.uid;
  const messageToSave = await readBody<Message>(event);

  if (!messageToSave || typeof messageToSave.role !== 'string' || typeof messageToSave.content !== 'string') {
    // Basic validation, can be expanded
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid message object in request body' });
  }

  const firestore: Firestore = getFirestore();
  const sessionDocRef = firestore.collection('adminChatSessions').doc(sessionId);
  const messagesCollectionRef = sessionDocRef.collection('messages');

  try {
    // 1. Verify session ownership
    const sessionDoc = await sessionDocRef.get();
    if (!sessionDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: `Not Found: Session ${sessionId} does not exist.` });
    }
    const sessionData = sessionDoc.data();
    if (sessionData?.adminUid !== adminUid) {
      console.warn(`Forbidden attempt by admin ${adminUid} to save message to session ${sessionId} owned by ${sessionData?.adminUid}`);
      throw createError({ statusCode: 403, statusMessage: `Forbidden: You do not own session ${sessionId}.` });
    }

    // 2. Prepare message for storage
    const serverTimestamp = FieldValue.serverTimestamp();
    const messageId = messageToSave.id || messagesCollectionRef.doc().id; // Use provided ID or generate new

    const storedMessageData = {
      ...messageToSave,
      id: messageId, // Ensure ID is part of the stored data
      createdAt: serverTimestamp, // Always use server timestamp for storage
    };

    // 3. Save message and update session atomically using a batch write
    const batch = firestore.batch();
    
    const newMessageRef = messagesCollectionRef.doc(messageId);
    batch.set(newMessageRef, storedMessageData);

    batch.update(sessionDocRef, {
      lastUpdatedAt: serverTimestamp,
      messageCount: FieldValue.increment(1),
    });

    await batch.commit();
    
    // For the response, we need to simulate what the serverTimestamp would resolve to.
    // A common practice is to refetch the message or return the input with a client-generated Date for `createdAt`.
    // For simplicity here, we'll return the input `messageToSave` but with its `id` and a new `Date()` for `createdAt`.
    // The client should ideally use the `createdAt` from a subsequent fetch if precise server time is critical.
    const savedMessageForResponse: Message = {
        ...messageToSave,
        id: messageId,
        createdAt: new Date(), // This is a client-side approximation for the response
    };
    
    setResponseStatus(event, 201);
    return savedMessageForResponse;

  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error saving message for session [${sessionId}], admin [${adminUid}]:`, errMessage, error);
     if (error && typeof error === 'object' && 'statusCode' in error && (error.statusCode === 403 || error.statusCode === 404) ) {
        throw error;
    }
    throw createError({ statusCode: 500, statusMessage: `Internal Server Error: Could not save message for session ${sessionId}. ${errMessage}` });
  }
});