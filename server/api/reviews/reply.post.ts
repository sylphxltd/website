import type { H3Event } from 'h3';
import { readBody } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';

interface ReplyRequestBody {
  appId: string;
  store: string; // e.g., 'googlePlay', 'appStore'
  reviewId: string;
  text: string;
}

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

  // 2. Read Request Body
  const body = await readBody<ReplyRequestBody>(event);
  if (!body || !body.appId || !body.store || !body.reviewId || !body.text) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing required fields (appId, store, reviewId, text)' });
  }

  const { appId, store, reviewId, text } = body;

  console.log(`Received reply request for review ${reviewId} in store ${store} for app ${appId}`);
  console.log(`Reply text: ${text}`);

  // 3. Interact with Firestore to save the reply
  const db = getAdminDb();
  const reviewDocRef = db.doc(`apps/${appId}/reviews/${reviewId}`);

  try {
    const reviewDoc = await reviewDocRef.get();

    if (!reviewDoc.exists) {
      throw createError({ statusCode: 404, statusMessage: 'Review not found' });
    }

    await reviewDocRef.update({
      reply: {
        body: text,
        createdAt: new Date().toISOString(),
      },
      isReplied: true,
    });

    console.log(`Reply saved for review ${reviewId}`);
    setResponseStatus(event, 200); // Or 201 if a new resource was created, but here we update
    return { success: true, message: 'Reply saved successfully.' };

  } catch (error) {
    console.error(`Error saving reply for review ${reviewId}:`, error);
    // Check if it's an error with a statusCode property (like our custom createError)
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      throw error; // Re-throw 404 if it's our custom error
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error saving reply' });
  }
});