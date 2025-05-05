import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import { getStorage } from 'firebase-admin/storage';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import type { Query, DocumentData, Timestamp } from 'firebase-admin/firestore'; // Import Firestore types
import type { Resource } from '~/stores/resources'; // Import type

// Helper function to generate signed URL (consider moving to a shared util if used elsewhere)
async function generateSignedUrl(filePath: string): Promise<string | null> {
  if (!filePath) return null;
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration
    });
    return url;
  } catch (error) {
    console.error(`Failed to generate signed URL for ${filePath}:`, error);
    return null; // Return null on error
  }
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

  // 2. Get Query Parameters
  const queryParams = getQuery(event);
  const appId = queryParams.appId?.toString();
  // Pagination parameters (optional for now, can be added later)
  // const pageSize = Number.parseInt(queryParams.limit?.toString() || '20', 10);
  // const afterCursor = queryParams.cursor?.toString() || null;

  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId query parameter' });
  }

  // 3. Query Firestore 'app_resources' Collection
  try {
    const db = getAdminDb();
    let resourcesQuery: Query<DocumentData> = db.collection("app_resources");

    // Filter by appId
    resourcesQuery = resourcesQuery.where("appId", "==", appId);

    // Add sorting (e.g., by creation date)
    resourcesQuery = resourcesQuery.orderBy("createdAt", "desc");

    // Add pagination if implemented later
    // if (afterCursor) { ... resourcesQuery = resourcesQuery.startAfter(cursorDoc); }
    // resourcesQuery = resourcesQuery.limit(pageSize);

    const querySnapshot = await resourcesQuery.get();

    // 4. Format and Return Resource List with Signed URLs
    const resourcesPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const storagePath = data.storagePath;

        // Generate signed URL for download
        const downloadUrl = await generateSignedUrl(storagePath);

        const toISOStringSafe = (timestamp: Timestamp | undefined | null): string => {
            try { return timestamp?.toDate().toISOString() || new Date(0).toISOString(); }
            catch { return new Date(0).toISOString(); }
        };

        // Map Firestore data and generated URL to Resource interface
        return {
          id: docSnapshot.id, // Use Firestore document ID
          name: data.name || data.filename || 'Unnamed Resource', // Prefer user-defined name
          path: storagePath, // Keep storage path
          url: downloadUrl || undefined, // Add the signed URL (or undefined if generation failed)
          size: Number(data.size || 0),
          contentType: data.contentType || 'application/octet-stream',
          createdAt: toISOStringSafe(data.createdAt),
          appId: data.appId,
          // Include other metadata stored in Firestore
          description: data.description,
          type: data.type,
          isPublic: data.isPublic,
          filename: data.filename, // Original filename
          uploaderUid: data.uploaderUid,
        } as Resource; // Cast to Resource, ensure interface matches
    });

    // Wait for all signed URL promises to resolve
    const resources = await Promise.all(resourcesPromises);

    // Pagination info (if implemented)
    // const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    // const nextPageCursor = lastVisibleDoc ? lastVisibleDoc.id : null;

    // Note: Total count would require a separate count query on Firestore if needed
    return {
      resources,
      // nextPageCursor: nextPageCursor, // If pagination added
      // total: total // If count query added
    };

  } catch (error) {
    console.error(`Error listing resources for appId ${appId} from Firestore:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching resources' });
  }
});