import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore, type Timestamp } from 'firebase-admin/firestore';
import type { Message } from 'ai'; // Using the full Message type from 'ai'

interface GetSessionMessagesResponse {
  messages: Message[];
}

export default defineEventHandler(async (event: H3Event): Promise<GetSessionMessagesResponse> => {
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken: DecodedIdToken;
  let adminAuth: Auth;

  // Extract sessionId from the route parameters
  const sessionId = event.context.params?.sessionId as string | undefined;
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing sessionId in path' });
  }

  try {
    adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      console.warn(`Forbidden attempt to get messages by non-admin user: ${decodedToken.uid} for session ${sessionId}`);
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error verifying admin token for getting messages (session ${sessionId}):`, message, error);
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
      throw error;
    }
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
  }

  const adminUid = decodedToken.uid;
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
      console.warn(`Forbidden attempt by admin ${adminUid} to access session ${sessionId} owned by ${sessionData?.adminUid}`);
      throw createError({ statusCode: 403, statusMessage: `Forbidden: You do not own session ${sessionId}.` });
    }

    // 2. Fetch messages
    const querySnapshot = await messagesCollectionRef
      .orderBy('createdAt', 'asc')
      .get();

    const messages: Message[] = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      // Convert Firestore Timestamp to Date for client compatibility with 'ai' Message type
      const createdAtDate = (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date();
      
      messages.push({
        id: data.id || doc.id, // Prefer stored id, fallback to doc.id
        role: data.role,
        content: data.content,
        createdAt: createdAtDate,
        parts: data.parts || [], // Ensure parts is an array
        // Include other fields from Message type if they are stored, e.g., toolInvocations
        toolInvocations: data.toolInvocations, 
      } as Message); // Type assertion might be needed if structure isn't perfectly matching
    }

    return { messages };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error getting messages for session [${sessionId}], admin [${adminUid}]:`, message, error);
    if (error && typeof error === 'object' && 'statusCode' in error && (error.statusCode === 403 || error.statusCode === 404) ) {
        throw error;
    }
    throw createError({ statusCode: 500, statusMessage: `Internal Server Error: Could not get messages for session ${sessionId}. ${message}` });
  }
});