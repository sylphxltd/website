import type { H3Event } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';

interface MediumConnectBody {
  integrationToken: string;
  mediumUserId: string;
}

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authentication: Admin check
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let adminUid: string;

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
    adminUid = decodedToken.uid; // Store admin UID for logging or future use
  } catch (error) {
     console.error("Error verifying admin token:", error);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. Request Body
  const body = await readBody<MediumConnectBody>(event);
  if (!body ||
      typeof body.integrationToken !== 'string' || body.integrationToken.trim() === '' ||
      typeof body.mediumUserId !== 'string' || body.mediumUserId.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid integrationToken or mediumUserId' });
  }

  // 3. Logic (Placeholder)
  // TODO: Implement Medium API token validation logic here (optional, based on Medium's capabilities)
  // This might involve making a request to Medium's API to verify the token and userId.

  const collectionPath = 'media_connections';
  const documentId = adminUid;

  try {
    const mediumData = {
      medium: {
        userId: body.mediumUserId,
        // TODO: Encrypt integrationToken before storing in production
        integrationToken: body.integrationToken,
        connectedAt: new Date().toISOString(),
      }
    };

    const firestore = getAdminDb(); // Get Firestore instance
    await firestore.collection(collectionPath).doc(documentId).set(mediumData, { merge: true });

    console.log(`Medium account connected for admin: ${adminUid}, user ID: ${body.mediumUserId}`);
    return { success: true, message: "Medium account connected and token stored successfully." };

  } catch (error) {
    console.error(`Error storing Medium token for admin ${adminUid}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Could not save Medium connection details.'
    });
  }
});