import type { H3Event } from 'h3'; // Use import type
import { getAdminAuth } from '~/server/utils/firebaseAdmin'; // Import the getter function
import type * as admin from 'firebase-admin'; // Import admin namespace for types

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth(); // Get the initialized auth instance
  // 1. Get Authorization Header
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    // 2. Verify ID Token & Check Admin Claim
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) { // Check if the 'admin' custom claim is true
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }

    // 3. List Users (if admin)
    // Consider pagination for large user bases
    const listUsersResult = await adminAuth.listUsers(1000); // Adjust maxResults as needed

    // 4. Format and Return User List
    // Add type for userRecord
    const users = listUsersResult.users.map((userRecord: admin.auth.UserRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims, // Include custom claims
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      },
      providerData: userRecord.providerData.map(provider => ({ // Add providerData
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoURL: provider.photoURL,
        uid: provider.uid
      }))
    }));

    return { users };

  } catch (error: unknown) {
    console.error("Error verifying token or listing users:", error);
    // Handle specific Firebase errors if needed
    if (error instanceof Error && (error.message.includes('TOKEN_EXPIRED') || error.message.includes('invalid-argument'))) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});