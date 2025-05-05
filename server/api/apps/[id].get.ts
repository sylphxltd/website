import type { H3Event } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import type { Timestamp } from 'firebase-admin/firestore';
import type { Application } from '~/stores/apps'; // Reuse the interface

export default defineEventHandler(async (event: H3Event) => {
  // 1. Get App ID from route parameters
  const appId = event.context.params?.id;
  if (!appId || typeof appId !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid application ID in URL path' });
  }

  // 2. Authorization Check (Allow any authenticated user to read, similar to list?)
  // OR restrict to admin only? Let's restrict to admin for consistency with other app endpoints.
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    // Decide on read permission: Admin only or any authenticated user?
    // Sticking with Admin only for now.
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error) {
     console.error("Error verifying admin token:", error);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 3. Fetch Document from Firestore
  const db = getAdminDb();
  const appRef = db.collection("apps").doc(appId);

  try {
    const docSnap = await appRef.get();

    if (!docSnap.exists) {
      throw createError({ statusCode: 404, statusMessage: `Not Found: Application with ID ${appId} does not exist.` });
    }

    const data = docSnap.data();
    if (!data) {
        // Should not happen if docSnap.exists is true, but good practice
        throw createError({ statusCode: 404, statusMessage: `Not Found: Application data missing for ID ${appId}.` });
    }

    // Helper to convert Admin SDK Timestamp to ISO string safely
    const toISOStringSafe = (timestamp: Timestamp | undefined | null): string => {
        try {
            return timestamp?.toDate().toISOString() || new Date(0).toISOString();
        } catch {
            return new Date(0).toISOString(); // Fallback for invalid timestamps
        }
    };

    // Format the data similar to the list API
    const appData: Application = {
      id: docSnap.id,
      name: data.name || 'Unnamed App',
      description: data.description,
      links: data.links || {},
      logoUrl: data.logoUrl,
      createdAt: toISOStringSafe(data.createdAt),
      updatedAt: toISOStringSafe(data.updatedAt),
      platforms: data.platforms || [],
      status: data.status || 'draft',
      appId: data.appId, // Specific App ID like com.example...
      tags: data.tags || [],
      features: data.features || [],
      screenshotUrls: data.screenshotUrls || [],
      downloads: data.downloads || 0, // Placeholder
      rating: data.rating || 0, // Placeholder
    };

    return appData; // Return the single application object

  } catch (error: unknown) { // Use unknown type
    // Define a type for errors potentially having statusCode
    interface HttpError extends Error {
        statusCode?: number;
    }
    // Handle potential 404 from the check above more safely
    if (error instanceof Error && 'statusCode' in error && (error as HttpError).statusCode === 404) {
        throw error; // Re-throw the specific 404 error
    }
    console.error(`Error fetching application ${appId} from Firestore:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error: Could not fetch application' });
  }
});