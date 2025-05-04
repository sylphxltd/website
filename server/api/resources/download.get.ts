import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import { getStorage } from 'firebase-admin/storage';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

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

  // 2. Get Query Parameter (file path)
  const query = getQuery(event);
  const filePath = query.path?.toString();

  if (!filePath || !filePath.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing file path query parameter' });
  }

  // Basic validation
  if (!filePath.startsWith('apps/')) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid file path format' });
  }

  // 3. Generate Signed URL
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath.trim());

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found: The specified resource does not exist.' });
    }

    // Generate a signed URL valid for a limited time (e.g., 15 minutes)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return { downloadUrl: signedUrl };

  } catch (error: unknown) {
    console.error(`Error generating signed URL for ${filePath}:`, error);
     if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        throw error; // Re-throw H3 errors
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error generating download URL' });
  }
});