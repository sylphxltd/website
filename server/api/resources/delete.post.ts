import type { H3Event } from 'h3';
import { readBody } from 'h3';
import { getStorage } from 'firebase-admin/storage';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

interface DeleteRequestBody {
  path: string; // Expecting the full path to the file in storage
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
  if (!body || typeof body.path !== 'string' || !body.path.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid file path in request body' });
  }

  const filePath = body.path.trim();

  // Basic validation: Ensure path looks somewhat valid (e.g., starts with 'apps/')
  if (!filePath.startsWith('apps/')) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid file path format' });
  }

  // 3. Delete File from Firebase Storage
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);

    // Check if file exists before attempting delete
    const [exists] = await file.exists();
    if (!exists) {
        console.warn(`Attempted to delete non-existent file: ${filePath}`);
        // Decide whether to return success or error if file doesn't exist
        // Returning success might be better UX if the goal is just to ensure it's gone
        return { success: true, message: `File ${filePath} does not exist or already deleted.` };
        // throw createError({ statusCode: 404, statusMessage: 'Not Found: File does not exist' });
    }

    await file.delete();
    console.log(`Successfully deleted ${filePath}`);

    // Optionally: Delete corresponding Firestore metadata document here if needed

    return { success: true, message: `File ${filePath} deleted successfully.` };

  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error during file deletion' });
  }
});