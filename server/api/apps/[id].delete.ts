import type { H3Event } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';

export default defineEventHandler(async (event: H3Event) => {
  // 1. Get App ID from route parameters
  const appId = event.context.params?.id;
  if (!appId || typeof appId !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid application ID in URL path' });
  }

  // 2. Authorization Check
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

  // 3. Delete Document in Firestore
  const db = getAdminDb();
  const appRef = db.collection("apps").doc(appId);

  try {
    // Optional: Check if document exists before deleting
    const docSnap = await appRef.get();
    if (!docSnap.exists) {
        // Depending on desired behavior, either return success or 404
        // Returning success might be simpler for the client (idempotent delete)
        console.log(`Application with ID ${appId} not found, but considering delete successful.`);
        return { success: true, id: appId };
        // OR: throw createError({ statusCode: 404, statusMessage: `Not Found: Application with ID ${appId} does not exist.` });
    }

    await appRef.delete();
    console.log(`Application deleted with ID: ${appId}`);
    return { success: true, id: appId };
  } catch (error) {
    console.error(`Error deleting application ${appId} from Firestore:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error: Could not delete application' });
  }
});