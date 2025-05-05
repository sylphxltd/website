import type { H3Event } from 'h3';
import { readBody } from 'h3';
import { getStorage } from 'firebase-admin/storage';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin'; // Import getAdminDb

interface DeleteRequestBody {
  resourceId: string; // Expecting the Firestore document ID
  // Optional: Keep appId if needed for verification, but resourceId should be enough
  // appId: string;
}

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check
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
  const body = await readBody<DeleteRequestBody>(event);
  if (!body || typeof body.resourceId !== 'string' || !body.resourceId.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid resourceId in request body' });
  }

  const resourceId = body.resourceId.trim();
  const db = getAdminDb();
  const resourceRef = db.collection("app_resources").doc(resourceId);
  let storagePath: string | null = null;

  // 3. Get Metadata (including storagePath) from Firestore first
  try {
      const docSnap = await resourceRef.get();
      if (!docSnap.exists) {
          console.warn(`Resource metadata with ID ${resourceId} not found in Firestore.`);
          // Consider if this should be an error or success (idempotency)
          return { success: true, message: `Resource metadata ${resourceId} not found.` };
      }
      storagePath = docSnap.data()?.storagePath;
      if (!storagePath || typeof storagePath !== 'string') {
          console.error(`Missing or invalid storagePath for resource ${resourceId}. Cannot delete storage file.`);
          // Decide how to handle: delete only Firestore doc or throw error?
          // Let's delete Firestore doc and return success with warning for now.
          await resourceRef.delete();
          return { success: true, message: `Resource metadata ${resourceId} deleted, but storage file path was missing or invalid.` };
      }
  } catch (error) {
      console.error(`Error fetching resource metadata ${resourceId}:`, error);
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching resource metadata' });
  }


  // 4. Delete File from Firebase Storage
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(storagePath); // Use path from Firestore

    const [exists] = await file.exists();
    if (exists) {
        await file.delete();
        console.log(`Successfully deleted storage file: ${storagePath}`);
    } else {
        console.warn(`Storage file not found, but proceeding: ${storagePath}`);
    }

  } catch (error) {
    console.error(`Error deleting storage file ${storagePath}:`, error);
    // Log the error but proceed to delete Firestore record anyway? Or throw?
    // Let's throw for now to indicate a potential inconsistency.
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error during file deletion from storage' });
  }

  // 5. Delete Firestore Document (after attempting storage deletion)
   try {
       await resourceRef.delete();
       console.log(`Successfully deleted Firestore document: ${resourceId}`);
       return { success: true, message: `Resource ${resourceId} deleted successfully.` };
   } catch (error) {
       console.error(`Error deleting Firestore document ${resourceId}:`, error);
       // Storage file might have been deleted, but Firestore failed. Log this inconsistency.
       throw createError({ statusCode: 500, statusMessage: 'Internal Server Error deleting resource metadata' });
   }
});