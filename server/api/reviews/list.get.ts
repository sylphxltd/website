import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import { getAdminDb, getAdminAuth } from '~/server/utils/firebaseAdmin'; // Use getAdminDb
import type { Review } from '~/stores/reviews'; // Import type
import type { Query } from 'firebase-admin/firestore'; // Import Query type for casting

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

  // 2. Get Query Parameters
  const queryParams = getQuery(event);
  const appId = queryParams.appId?.toString();
  const page = Number.parseInt(queryParams.page?.toString() || '1', 10);
  const limit = Number.parseInt(queryParams.limit?.toString() || '10', 10);
  const store = queryParams.store?.toString(); // e.g., 'googlePlay', 'appStore', or undefined for all
  const rating = queryParams.rating ? Number.parseInt(queryParams.rating.toString(), 10) : undefined;
  const dateFrom = queryParams.dateFrom?.toString();
  const dateTo = queryParams.dateTo?.toString();
  const hasReplyParam = queryParams.hasReply?.toString(); // 'true', 'false', or undefined

  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId query parameter' });
  }

  if (page <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Page number must be positive' });
  }
  if (limit <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Limit must be positive' });
  }

  // TODO: Ensure necessary Firestore indexes are created for these queries (e.g., on appId, store, rating, createdAt, isReplied).

  try {
    const db = getAdminDb(); // Get Firestore instance
    const reviewsCollectionRef = db.collection('apps').doc(appId).collection('reviews');
    let firestoreQuery: Query = reviewsCollectionRef; // Base query

    // Apply filters
    if (store && store !== 'all') {
      firestoreQuery = firestoreQuery.where('store', '==', store);
    }
    if (rating !== undefined && !Number.isNaN(rating)) {
      firestoreQuery = firestoreQuery.where('rating', '>=', rating);
    }
    if (dateFrom) {
      // Firestore expects ISO string or Timestamp. Ensure dateFrom is valid.
      firestoreQuery = firestoreQuery.where('createdAt', '>=', dateFrom);
    }
    if (dateTo) {
      // Firestore expects ISO string or Timestamp. Ensure dateTo is valid.
      firestoreQuery = firestoreQuery.where('createdAt', '<=', dateTo);
    }
    if (hasReplyParam !== undefined) {
      const hasReply = hasReplyParam === 'true';
      // Assuming 'isReplied' is a boolean field in Firestore indicating if a reply exists.
      // If 'reply' is an object, you might query for its existence differently,
      // e.g., where('reply', '!=', null), but this can be tricky with Firestore.
      // A dedicated 'isReplied' boolean field is generally more straightforward for querying.
      firestoreQuery = firestoreQuery.where('isReplied', '==', hasReply);
    }

    // Create a separate query for total count (without pagination and ordering for count)
    const countQuery = firestoreQuery; // All filters applied

    // Apply ordering for fetching data
    firestoreQuery = firestoreQuery.orderBy('createdAt', 'desc');

    // Apply pagination
    // Note: offset() has performance implications for large datasets.
    // Consider cursor-based pagination (startAfter()) for better performance at scale.
    const offset = (page - 1) * limit;
    firestoreQuery = firestoreQuery.limit(limit).offset(offset);

    // Execute queries
    const [snapshot, countSnapshot] = await Promise.all([
      firestoreQuery.get(),
      countQuery.count().get() // Get total count with filters
    ]);

    const reviews: Review[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        appId: data.appId,
        store: data.store,
        author: data.author,
        rating: data.rating,
        title: data.title,
        body: data.body,
        createdAt: data.createdAt, // Assuming createdAt is stored as ISO string or Timestamp
        reply: data.reply || null, // Ensure reply is null if not present
        isReplied: data.isReplied !== undefined ? data.isReplied : !!data.reply, // Derive if not present
      } as Review;
    });

    const total = countSnapshot.data().count;

    return {
      reviews,
      total,
    };

  } catch (error) {
    console.error(`Error fetching reviews from Firestore for appId ${appId}:`, error);
    // Check for specific Firestore error codes if needed
    // Using a type assertion for error properties if not using a more specific error type
    const firebaseError = error as { code?: string; message?: string };

    if (firebaseError.code === 'permission-denied') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden: Permission denied to access reviews.' });
    }
    if (firebaseError.message?.includes('indexes')) {
        console.warn("Potential Firestore indexing issue. Ensure all necessary composite indexes are created.");
        // You might want to return a more specific error or a generic one
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching reviews from Firestore' });
  }
});