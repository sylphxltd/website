import type { H3Event } from 'h3';
import { getQuery, readMultipartFormData } from 'h3';
import { getStorage } from 'firebase-admin/storage';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import { randomUUID } from 'node:crypto';

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

  // 2. Get Query Parameters (for appId)
  const query = getQuery(event);
  const appId = query.appId?.toString();

  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId query parameter' });
  }

  // 3. Read Multipart Form Data
  const formData = await readMultipartFormData(event);
  const fileData = formData?.find(item => item.name === 'file');

  if (!fileData || !fileData.filename || !fileData.data) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing file in form data' });
  }

  // 4. Upload to Firebase Storage
  try {
    const bucket = getStorage().bucket();
    // Construct a unique path, e.g., apps/{appId}/resources/{uuid}-{filename}
    const uniqueFilename = `${randomUUID()}-${fileData.filename}`;
    const filePath = `apps/${appId}/resources/${uniqueFilename}`;
    const file = bucket.file(filePath);

    // Create a write stream and upload the file buffer
    const stream = file.createWriteStream({
      metadata: {
        contentType: fileData.type, // Use MIME type from form data
      },
      resumable: false, // Use simple upload for potentially smaller files
    });

    await new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        console.error(`Error uploading ${filePath}:`, err);
        reject(createError({ statusCode: 500, statusMessage: 'Failed to upload file to storage' }));
      });
      stream.on('finish', () => {
        console.log(`Successfully uploaded ${filePath}`);
        resolve(true);
      });
      stream.end(fileData.data); // Write the buffer to the stream
    });

    // Optionally: Store metadata in Firestore here if needed

    return { success: true, message: `File ${fileData.filename} uploaded successfully.`, path: filePath };

  } catch (error) {
    console.error(`Error processing upload for appId ${appId}:`, error);
    // Check if it's already an H3 error
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error during upload' });
  }
});