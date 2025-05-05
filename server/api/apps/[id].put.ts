import type { H3Event } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore'; // Use FieldValue for Admin SDK timestamp
import type { AppFormData } from '~/stores/apps'; // Reuse the interface

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

  // 3. Read and Validate Request Body
  const body = await readBody<AppFormData>(event);
  // Basic validation - ensure name is present, add more checks as needed
  if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid application name in request body' });
  }

  // 4. Prepare Data for Firestore Update
  const db = getAdminDb();
  const appRef = db.collection("apps").doc(appId);

  // Clean up links
  const linksToSave = Object.entries(body.links || {})
    .filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
    .reduce((obj, [key, value]) => {
      obj[key] = value.trim();
      return obj;
    }, {} as { [key: string]: string });

  const updateData = {
    name: body.name.trim(),
    description: body.description || '',
    links: linksToSave,
    logoUrl: body.logoUrl || '',
    platforms: body.platforms || [],
    status: body.status || 'draft',
    appId: body.appId || '', // This is the specific ID like com.example... not the Firestore doc ID
    tags: body.tags || [],
    features: body.features || [],
    screenshotUrls: body.screenshotUrls || [],
    updatedAt: FieldValue.serverTimestamp() // Update the timestamp
  };

  // 5. Update Document in Firestore
  try {
    // Check if document exists before updating (optional but good practice)
    const docSnap = await appRef.get();
    if (!docSnap.exists) {
        throw createError({ statusCode: 404, statusMessage: `Not Found: Application with ID ${appId} does not exist.` });
    }

    await appRef.update(updateData);
    console.log(`Application updated with ID: ${appId}`);
    return { success: true, id: appId };
  } catch (error: unknown) { // Use unknown type
    // Define a type for errors potentially having statusCode
    interface HttpError extends Error {
        statusCode?: number;
    }

    // Handle potential 404 from the check above more safely
    if (error instanceof Error && 'statusCode' in error && (error as HttpError).statusCode === 404) {
        throw error; // Re-throw the specific 404 error
    }
    console.error(`Error updating application ${appId} in Firestore:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error: Could not update application' });
  }
});