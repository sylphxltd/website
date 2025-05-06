import type { H3Event } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import type { MediaAccount } from '~/stores/media';

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check (Admin Only)
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const adminAuth = getAdminAuth();
    const db = getAdminDb(); // Get Firestore instance
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }

    const adminUid = decodedToken.uid;
    const connectedAccounts: MediaAccount[] = [];

    const docRef = db.collection('media_connections').doc(adminUid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const docData = docSnap.data();
      if (docData) {
        // Check for Medium connection
        if (docData.medium?.userId) {
          connectedAccounts.push({
            id: docData.medium.userId,
            platform: 'medium',
            name: `Medium (${docData.medium.username || docData.medium.userId})`, // Use username if available
          });
        }
        // Add similar checks for other platforms like 'x', 'facebook' here
        // Example for 'x' (if structure is similar):
        // if (docData.x?.userId) {
        //   connectedAccounts.push({
        //     id: docData.x.userId,
        //     platform: 'x',
        //     name: `X (${docData.x.username || docData.x.userId})`,
        //   });
        // }
      }
    }
    return { accounts: connectedAccounts };

  } catch (error: unknown) {
    // Check if it's an auth error
    if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as {code: unknown}).code === 'string' && (error as {code: string}).code.startsWith('auth/')) {
      console.error("Error verifying admin token:", error);
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
    }
    // General error
    console.error("Error fetching media accounts from Firestore:", error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching accounts' });
  }
});