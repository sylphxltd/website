import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import { getStorage } from 'firebase-admin/storage';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { Resource } from '~/stores/resources'; // Import type

// Helper to format size
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // Use template literal, Number.parseFloat, and ** operator
  return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
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
  const query = getQuery(event);
  const appId = query.appId?.toString();
  const pageToken = query.pageToken?.toString(); // For pagination
  const pageSize = Number.parseInt(query.limit?.toString() || '20', 10); // Default page size

  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId query parameter' });
  }

  // 3. List Files from Firebase Storage
  try {
    const bucket = getStorage().bucket(); // Use default bucket
    const prefix = `apps/${appId}/resources/`;

    const [files, nextQuery] = await bucket.getFiles({
      prefix: prefix,
      maxResults: pageSize + 1, // Fetch one extra to check if there's a next page
      pageToken: pageToken,
      autoPaginate: false, // Important for manual pagination control
    });

    // Determine if there's a next page
    let nextPageToken: string | undefined = undefined;
    if (files.length > pageSize) {
      // If we fetched more than pageSize, the last one is the start of the next page
      nextPageToken = files[pageSize].name; // Use the name as a simple token (adjust if needed)
      files.length = pageSize; // Trim the extra file
    } else if (nextQuery?.pageToken) {
        // Use the pageToken provided by the API if available and we didn't fetch extra
         nextPageToken = nextQuery.pageToken;
    }


    // 4. Format and Return Resource List
    const resources: Resource[] = files
      // Filter out the "folder" itself if it appears as an empty object
      // Safely convert size to number before comparison
      .filter(file => file.name !== prefix || Number(file.metadata.size || 0) > 0)
      .map(file => ({
        id: file.name, // Use full path as ID for now
        name: file.name.substring(prefix.length), // Extract filename
        path: file.name,
        size: Number(file.metadata.size || 0), // Ensure size is a number
        contentType: file.metadata.contentType || 'application/octet-stream',
        createdAt: file.metadata.timeCreated || new Date(0).toISOString(),
        appId: appId,
        // url: // Generate signed URL if needed, requires separate logic/API call
      }));

    // Note: Total count is not easily available with getFiles pagination
    return {
      resources,
      nextPageToken: nextPageToken, // Send token for next page
      // total: // Not available directly
    };

  } catch (error) {
    console.error(`Error listing resources for appId ${appId}:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching resources' });
  }
});