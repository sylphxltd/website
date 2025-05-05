import type { H3Event } from 'h3';
import { getQuery, readMultipartFormData } from 'h3';
import { getStorage } from 'firebase-admin/storage';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import type { DecodedIdToken } from 'firebase-admin/auth'; // Import DecodedIdToken type
import { FieldValue } from 'firebase-admin/firestore'; // Import FieldValue
import { randomUUID } from 'node:crypto';

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let decodedToken: DecodedIdToken; // Add type annotation

  try {
    const adminAuth = getAdminAuth();
    decodedToken = await adminAuth.verifyIdToken(idToken); // Store decoded token
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
  const nameData = formData?.find(item => item.name === 'name');
  const descriptionData = formData?.find(item => item.name === 'description');
  const typeData = formData?.find(item => item.name === 'type');
  const isPublicData = formData?.find(item => item.name === 'isPublic');

  if (!fileData || !fileData.filename || !fileData.data) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing file in form data' });
  }
  if (!nameData || !nameData.data) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing resource name in form data' });
  }

  const resourceName = nameData.data.toString().trim();
  const resourceDescription = descriptionData?.data.toString() || '';
  const resourceType = typeData?.data.toString() || 'other';
  const resourceIsPublic = isPublicData?.data.toString() === 'true'; // Convert string to boolean

  // 4. Upload to Firebase Storage
  let filePath = '';
  let fileSize = 0;
  let fileContentType = fileData.type || 'application/octet-stream';

  try {
    const bucket = getStorage().bucket();
    const uniqueFilename = `${randomUUID()}-${fileData.filename}`;
    filePath = `apps/${appId}/resources/${uniqueFilename}`;
    const file = bucket.file(filePath);

    const stream = file.createWriteStream({
      metadata: { contentType: fileContentType },
      resumable: false,
    });

    await new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(fileData.data);
    });

    // Get file metadata after upload to confirm size etc.
    const [metadata] = await file.getMetadata();
    fileSize = Number(metadata.size || 0);
    fileContentType = metadata.contentType || fileContentType; // Update with actual content type if available

    console.log(`Successfully uploaded ${filePath}`);

  } catch (error) {
    console.error(`Error uploading file for appId ${appId}:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error during file upload' });
  }

  // 5. Store Metadata in Firestore
  try {
      const db = getAdminDb();
      const resourceData = {
          appId: appId,
          storagePath: filePath, // Store the full path
          name: resourceName,
          description: resourceDescription,
          type: resourceType,
          isPublic: resourceIsPublic,
          size: fileSize,
          contentType: fileContentType,
          filename: fileData.filename, // Store original filename
          uploaderUid: decodedToken.uid, // Store uploader's UID
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('app_resources').add(resourceData); // Use 'app_resources' collection
      console.log(`Resource metadata stored with ID: ${docRef.id}`);

      return { success: true, message: `File ${fileData.filename} uploaded and metadata stored.`, resourceId: docRef.id, path: filePath };

  } catch (error) {
      console.error(`Error storing resource metadata for ${filePath}:`, error);
      // Attempt to delete the uploaded file if metadata storage fails? (Optional cleanup)
      try {
          await getStorage().bucket().file(filePath).delete();
          console.warn(`Deleted orphaned file ${filePath} due to Firestore error.`);
      } catch (deleteError) {
          console.error(`Failed to delete orphaned file ${filePath}:`, deleteError);
      }
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error storing resource metadata' });
  }
});