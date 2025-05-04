import type { H3Event } from 'h3';
import { readBody } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

interface SetStatusRequestBody {
  uid: string;
  disabled: boolean; // true to disable, false to enable
}

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check (Admin Only)
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  let callingAdminUid: string;
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
    callingAdminUid = decodedToken.uid; // Get the UID of the admin making the call
  } catch (error) {
     console.error("Error verifying admin token:", error);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. Read Request Body
  const body = await readBody<SetStatusRequestBody>(event);
  if (!body || typeof body.uid !== 'string' || typeof body.disabled !== 'boolean') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid uid or disabled status' });
  }

  const { uid: targetUid, disabled } = body;

  // 3. Prevent admin from disabling their own account via this API
  if (callingAdminUid === targetUid && disabled === true) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Admin cannot disable their own account.' });
  }

  // 4. Update User Status using Admin SDK
  try {
    const adminAuth = getAdminAuth();
    await adminAuth.updateUser(targetUid, {
      disabled: disabled,
    });

    const action = disabled ? 'disabled' : 'enabled';
    console.log(`Successfully ${action} user ${targetUid}`);
    return { success: true, message: `User ${targetUid} successfully ${action}.` };

  } catch (error: unknown) {
    console.error(`Error updating user status for ${targetUid}:`, error);
     // Handle specific Firebase errors
     if (error instanceof Error) {
         if (error.message.includes('USER_NOT_FOUND')) {
              throw createError({ statusCode: 404, statusMessage: 'Not Found: Target user UID does not exist.' });
         }
     }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error updating user status' });
  }
});