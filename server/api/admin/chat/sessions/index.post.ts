import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth'; // Import Auth type
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore'; // Import getFirestore
import type { Message } from 'ai'; // Changed from CoreMessage to Message

interface CreateSessionRequestBody {
  firstUserMessage: string;
}

interface CreateSessionResponse {
  sessionId: string;
  initialMessage: Message; // Changed from CoreMessage to Message
}

export default defineEventHandler(async (event: H3Event): Promise<CreateSessionResponse> => {
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken: DecodedIdToken;
  let adminAuth: Auth; // Changed from FirebaseAdminAuth to Auth

  try {
    adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      console.warn(`Forbidden attempt to create session by non-admin user: ${decodedToken.uid}`);
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error verifying admin token for session creation:", message, error);
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
      throw error;
    }
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
  }

  const adminUid = decodedToken.uid;
  const requestBody = await readBody<CreateSessionRequestBody>(event);

  if (!requestBody || typeof requestBody.firstUserMessage !== 'string' || requestBody.firstUserMessage.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or empty "firstUserMessage" in request body' });
  }

  const firestore: Firestore = getFirestore(); // Use getFirestore()
  const sessionsCollection = firestore.collection('adminChatSessions');
  const messagesCollectionRef = (sessionId: string) => sessionsCollection.doc(sessionId).collection('messages');

  try {
    const now = FieldValue.serverTimestamp();
    const firstUserMessageContent = requestBody.firstUserMessage.trim();
    const snippet = firstUserMessageContent.substring(0, 75); // Increased snippet length slightly

    // 1. Create new session document
    const newSessionRef = sessionsCollection.doc();
    const sessionId = newSessionRef.id;

    await newSessionRef.set({
      adminUid,
      createdAt: now,
      lastUpdatedAt: now,
      firstUserMessageSnippet: snippet,
      title: snippet, // Use snippet as initial title
      messageCount: 1, // Starts with one message
    });

    // 2. Create the first message in the subcollection
    const firstMessageRef = messagesCollectionRef(sessionId).doc();
    const firstMessageId = firstMessageRef.id;

    // Constructing the message object that conforms to the `Message` type from 'ai'
    const initialMessageForResponse: Message = {
      id: firstMessageId,
      role: 'user',
      content: firstUserMessageContent,
      createdAt: new Date(), // createdAt is part of the Message type
      parts: [{ type: 'text', text: firstUserMessageContent }], // Ensure parts is included if expected by Message type for user role
    };
    
    // For storage, we use a server timestamp for createdAt for consistency.
    // The object being stored should also align with what we intend to retrieve.
    // We can store the `Message` like structure directly, but ensure `createdAt` is a Firestore Timestamp.
    const messageToStore = {
      ...initialMessageForResponse, // Spread all fields including id, role, content, parts
      createdAt: now, // Override with server timestamp for storage
    };
    await firstMessageRef.set(messageToStore);
    
    setResponseStatus(event, 201);
    return {
      sessionId,
      // Return the initialMessageForResponse which has createdAt as a Date object, as expected by client.
      initialMessage: initialMessageForResponse,
    };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error creating chat session for admin [${adminUid}]:`, message, error);
    throw createError({ statusCode: 500, statusMessage: `Internal Server Error: Could not create chat session. ${message}` });
  }
});