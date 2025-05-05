import type { H3Event } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore'; // Use FieldValue for Admin SDK timestamp
import type { AppFormData } from '~/stores/apps'; // Reuse the interface

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

  // 2. Read and Validate Request Body
  const body = await readBody<AppFormData>(event);
  if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid application name' });
  }

  // 3. Prepare Data for Firestore
  const db = getAdminDb();
  const appsCollection = db.collection("apps");

  // Clean up links (remove empty ones) - Reuse logic from client store if applicable
  const linksToSave = Object.entries(body.links || {})
    .filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
    .reduce((obj, [key, value]) => {
      obj[key] = value.trim();
      return obj;
    }, {} as { [key: string]: string });

  const appData = {
    name: body.name.trim(),
    description: body.description || '',
    links: linksToSave,
    logoUrl: body.logoUrl || '',
    platforms: body.platforms || [],
    status: body.status || 'draft',
    appId: body.appId || '',
    tags: body.tags || [],
    features: body.features || [],
    screenshotUrls: body.screenshotUrls || [],
    createdAt: FieldValue.serverTimestamp(), // Use Admin SDK FieldValue
    updatedAt: FieldValue.serverTimestamp()  // Use Admin SDK FieldValue
  };

  // 4. Add Document to Firestore
  try {
    const docRef = await appsCollection.add(appData);
    console.log(`Application created with ID: ${docRef.id}`);
    // Return the new document ID and success status
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating application in Firestore:", error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error: Could not create application' });
  }
});