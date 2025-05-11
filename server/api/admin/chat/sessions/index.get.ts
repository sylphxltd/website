import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken, Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore, type Timestamp } from 'firebase-admin/firestore';

/**
 * Interface representing a Firestore timestamp-like object
 */
interface TimestampLike {
  seconds: number;
  nanoseconds: number;
}

/**
 * Normalize a Firestore timestamp to ensure it always has valid seconds and nanoseconds
 * Will fallback to createdAt or Unix Epoch (Jan 1, 1970) if lastUpdatedAt is invalid
 */
function normalizeFirestoreTimestamp(data: Record<string, unknown>, sessionId: string): TimestampLike {
  // Check if lastUpdatedAt is a valid Firestore Timestamp object
  if (data.lastUpdatedAt &&
      typeof data.lastUpdatedAt === 'object' &&
      'seconds' in data.lastUpdatedAt &&
      typeof data.lastUpdatedAt.seconds === 'number' &&
      'nanoseconds' in data.lastUpdatedAt &&
      typeof data.lastUpdatedAt.nanoseconds === 'number') {
    return {
      seconds: data.lastUpdatedAt.seconds,
      nanoseconds: data.lastUpdatedAt.nanoseconds
    };
  }
  
  // Fallback to createdAt if lastUpdatedAt is invalid
  if (data.createdAt &&
      typeof data.createdAt === 'object' &&
      'seconds' in data.createdAt &&
      typeof data.createdAt.seconds === 'number' &&
      'nanoseconds' in data.createdAt &&
      typeof data.createdAt.nanoseconds === 'number') {
    console.warn(`Invalid lastUpdatedAt, falling back to createdAt for session: ${sessionId}`);
    return {
      seconds: data.createdAt.seconds,
      nanoseconds: data.createdAt.nanoseconds
    };
  }
  
  // Default to Unix Epoch if both lastUpdatedAt and createdAt are invalid
  console.warn(`Invalid lastUpdatedAt and createdAt, defaulting to Unix Epoch for session: ${sessionId}`);
  return {
    seconds: 0,
    nanoseconds: 0
  };
}

interface SessionSummary {
  sessionId: string;
  title?: string;
  firstUserMessageSnippet: string;
  lastUpdatedAt: { seconds: number, nanoseconds: number }; // Always an object with seconds and nanoseconds
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
      // Normalize lastUpdatedAt to ensure it's always a valid timestamp object
      // with seconds and nanoseconds properties
      const normalizedLastUpdatedAt = normalizeFirestoreTimestamp(data, doc.id);
      
      sessions.push({
        sessionId: doc.id,
        title: data.title,
        firstUserMessageSnippet: data.firstUserMessageSnippet,
        lastUpdatedAt: normalizedLastUpdatedAt, // Normalized timestamp with seconds and nanoseconds
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