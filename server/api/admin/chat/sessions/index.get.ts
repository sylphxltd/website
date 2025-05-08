import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore, type Timestamp } from 'firebase-admin/firestore';

interface SessionSummary {
  sessionId: string;
  title?: string;
  firstUserMessageSnippet: string;
  lastUpdatedAt: Timestamp | string; // Firestore Timestamp, or string for client
  messageCount: number;
}

interface ListSessionsResponse {
  sessions: SessionSummary[];
}

export default defineEventHandler(async (event: H3Event): Promise<ListSessionsResponse> => {
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken: DecodedIdToken;
  let adminAuth: Auth;

  try {
    adminAuth = getAdminAuth(); // Assuming this initializes admin app if not already
    decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      console.warn(`Forbidden attempt to list sessions by non-admin user: ${decodedToken.uid}`);
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error verifying admin token for listing sessions:", message, error);
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
      throw error;
    }
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
  }

  const adminUid = decodedToken.uid;
  const firestore: Firestore = getFirestore();
  const sessionsCollection = firestore.collection('adminChatSessions');

  try {
    const querySnapshot = await sessionsCollection
      .where('adminUid', '==', adminUid)
      .orderBy('lastUpdatedAt', 'desc')
      .get();

    const sessions: SessionSummary[] = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      // Ensure lastUpdatedAt is converted to a client-friendly format if necessary,
      // or keep as Timestamp if client can handle it. For now, keep as is from DB.
      sessions.push({
        sessionId: doc.id,
        title: data.title,
        firstUserMessageSnippet: data.firstUserMessageSnippet,
        lastUpdatedAt: data.lastUpdatedAt, // This will be a Firestore Timestamp object
        messageCount: data.messageCount,
      });
    }

    return { sessions };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error listing chat sessions for admin [${adminUid}]:`, message, error);
    throw createError({ statusCode: 500, statusMessage: `Internal Server Error: Could not list chat sessions. ${message}` });
  }
});