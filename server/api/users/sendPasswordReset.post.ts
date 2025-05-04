import type { H3Event } from 'h3';
import { readBody } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

interface ResetPasswordRequestBody {
  uid: string; // UID of the user to send the reset email to
}

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check (Admin Only)
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

  // 2. Read Request Body
  const body = await readBody<ResetPasswordRequestBody>(event);
  if (!body || typeof body.uid !== 'string' || !body.uid.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid user UID' });
  }

  const targetUid = body.uid.trim();

  // 3. Trigger Password Reset Email using Admin SDK
  try {
    const adminAuth = getAdminAuth();
    
    // First, get the user's email address using their UID
    const userRecord = await adminAuth.getUser(targetUid);
    const userEmail = userRecord.email;

    if (!userEmail) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Target user does not have an email address.' });
    }

    // Generate the password reset link (uses default template unless actionCodeSettings are provided)
    const link = await adminAuth.generatePasswordResetLink(userEmail);
    
    // **Important:** The Admin SDK *generates* the link, it doesn't *send* the email automatically.
    // You need to send this link to the user via your own email sending mechanism.
    // For now, we'll just log it and return success. A real implementation needs an email service.
    
    console.log(`Password reset link generated for ${userEmail}: ${link}`); // Log link for now
    // TODO: Integrate with an email service (e.g., SendGrid, Nodemailer) to send the link to userEmail.
    
    return { success: true, message: `Password reset initiated for ${userEmail}. Link logged on server.` };

  } catch (error: unknown) {
    console.error(`Error generating password reset link for user ${targetUid}:`, error);
     // Handle specific Firebase errors
     if (error instanceof Error) {
         if (error.message.includes('USER_NOT_FOUND')) {
              throw createError({ statusCode: 404, statusMessage: 'Not Found: Target user UID does not exist.' });
         }
     }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error generating password reset link' });
  }
});