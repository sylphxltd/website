import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type * as admin from 'firebase-admin'; // Import admin namespace for types
import type { ApiUser } from '~/stores/adminUsers'; // Import type for consistency

export default defineEventHandler(async (event: H3Event) => {
  // 1. Get User ID from route parameters
  const userId = event.context.params?.id;
  if (!userId || typeof userId !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid user ID in URL path' });
  }

  // 2. Authorization Check (Admin Only)
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error) {
     console.error("Error verifying admin token:", error);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 3. Fetch User Record using Admin SDK
  try {
    const adminAuth = getAdminAuth();
    const userRecord: admin.auth.UserRecord = await adminAuth.getUser(userId);

    // 4. Format User Data (similar to list API)
    const userData: ApiUser = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      phoneNumber: userRecord.phoneNumber,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims,
      tenantId: userRecord.tenantId,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        // lastRefreshTime is also available if needed
      },
      providerData: userRecord.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoURL: provider.photoURL,
        uid: provider.uid
      }))
    };

    return userData; // Return the single user object

  } catch (error: unknown) {
    console.error(`Error fetching user ${userId}:`, error);
    // Handle specific Firebase errors (e.g., user not found)
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/user-not-found') {
            throw createError({ statusCode: 404, statusMessage: `Not Found: User with ID ${userId} does not exist.` });
        }
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching user data' });
  }
});