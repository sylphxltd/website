import type { H3Event } from 'h3'; // Use import type
import { getAdminAuth } from '~/server/utils/firebaseAdmin'; // Import the getter function
import type * as admin from 'firebase-admin'; // Import admin namespace for types

import { getQuery } from 'h3'; // Import getQuery

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth(); // Get the initialized auth instance
  const query = getQuery(event); // Get query parameters

  // Parse query parameters with defaults/validation
  const limit = Number.parseInt(query.limit?.toString() || '10', 10); // Use Number.parseInt
  const pageToken = query.pageToken?.toString() || undefined;
  const search = query.search?.toString().toLowerCase() || '';
  const role = query.role?.toString() || ''; // 'admin', 'user', or ''
  // Parse 'disabled' query param ('true'/'false')
  const disabledFilter = query.disabled?.toString();
  const filterByDisabled = disabledFilter === 'true' ? true : disabledFilter === 'false' ? false : undefined;

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

    // 3. List Users with Pagination (if admin)
    const listUsersResult = await adminAuth.listUsers(limit, pageToken);

    // 4. Filter and Format User List
    let filteredUsers = listUsersResult.users;

    // Apply server-side filtering AFTER fetching the page
    if (search) {
        filteredUsers = filteredUsers.filter(user =>
            (user.displayName?.toLowerCase().includes(search) || false) ||
            (user.email?.toLowerCase().includes(search) || false)
        );
    }
    if (role === 'admin') {
        filteredUsers = filteredUsers.filter(user => user.customClaims?.admin === true);
    } else if (role === 'user') {
        filteredUsers = filteredUsers.filter(user => !user.customClaims?.admin);
    }
    if (filterByDisabled !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.disabled === filterByDisabled);
    }

    // Format the filtered users
    const users = filteredUsers.map((userRecord: admin.auth.UserRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      phoneNumber: userRecord.phoneNumber, // Add phoneNumber
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims,
      tenantId: userRecord.tenantId, // Add tenantId
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

    // 5. Return filtered users and next page token
    return {
        users,
        nextPageToken: listUsersResult.pageToken
        // Note: Total count isn't easily available from listUsers
    };

  } catch (error: unknown) {
    console.error("Error verifying token or listing/filtering users:", error);
    // Handle specific Firebase errors if needed
    if (error instanceof Error && (error.message.includes('TOKEN_EXPIRED') || error.message.includes('invalid-argument'))) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});