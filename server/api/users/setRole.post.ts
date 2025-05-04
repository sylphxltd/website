import type { H3Event } from 'h3'; // Use import type
import { getAdminAuth } from '~/server/utils/firebaseAdmin'; // Import the getter function

interface SetRoleRequestBody {
  uid: string;
  role: { admin: boolean }; // Define the expected role structure
}

export default defineEventHandler(async (event: H3Event) => {
  // 1. Get Authorization Header
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  // 2. Read Request Body
  const body = await readBody<SetRoleRequestBody>(event);
  if (!body || typeof body.uid !== 'string' || typeof body.role?.admin !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid uid or role (expecting { admin: boolean })' });
  }

  const { uid: targetUid, role } = body;

  try {
    const adminAuth = getAdminAuth(); // Get the initialized auth instance
    // 3. Verify ID Token & Check Admin Claim of the CALLER
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) { // Check if the CALLER is an admin
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }

    // Prevent admin from accidentally removing their own admin rights via this API? (Optional safeguard)
    // if (decodedToken.uid === targetUid && role.admin === false) {
    //   throw createError({ statusCode: 400, statusMessage: 'Bad Request: Admin cannot remove their own admin role via this API.' });
    // }

    // 4. Set Custom Claims for the TARGET user (if caller is admin)
    await adminAuth.setCustomUserClaims(targetUid, role);

    // 5. Return Success Response
    return { success: true, message: `Successfully set role ${JSON.stringify(role)} for user ${targetUid}` };

  } catch (error: unknown) {
    console.error("Error verifying token or setting custom claims:", error);
    // Handle specific Firebase errors
    if (error instanceof Error) {
        if (error.message.includes('TOKEN_EXPIRED') || error.message.includes('invalid-argument')) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid or expired token' });
        }
        if (error.message.includes('USER_NOT_FOUND')) {
             throw createError({ statusCode: 404, statusMessage: 'Not Found: Target user UID does not exist.' });
        }
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});