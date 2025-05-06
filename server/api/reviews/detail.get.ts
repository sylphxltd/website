import { defineEventHandler, getQuery, createError, getHeader } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import type { Timestamp } from 'firebase-admin/firestore';

// Interface for a Review (consistent with stores/reviews.ts)
// Allow createdAt and reply.createdAt to be Timestamp initially from Firestore
interface ReviewFirestoreData {
  appId: string;
  store: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string | Timestamp;
  reply?: {
    body: string;
    createdAt: string | Timestamp;
  } | null;
}

interface Review {
  id: string;
  appId: string;
  store: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string; // ISO timestamp string
  reply?: {
    body: string;
    createdAt: string; // ISO timestamp string
  } | null;
}

export default defineEventHandler(async (event) => {
  // 1. Authentication
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
  } catch (authError) {
     console.error("Error verifying admin token:", authError);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. Query Parameters
  const query = getQuery(event);
  const reviewId = query.reviewId as string | undefined;
  const appId = query.appId as string | undefined;

  // 3. Validate their presence
  if (!reviewId || !appId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required query parameters: reviewId and appId.',
    });
  }

  try {
    const db = getAdminDb();
    const reviewPath = `apps/${appId}/reviews/${reviewId}`;
    const reviewDoc = await db.doc(reviewPath).get();

    if (!reviewDoc.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Review not found.',
      });
    }

    const reviewDataFromFirestore = reviewDoc.data() as ReviewFirestoreData;

    // Ensure createdAt is a string if it's a Timestamp
    let createdAtString: string;
    if (typeof reviewDataFromFirestore.createdAt === 'string') {
        createdAtString = reviewDataFromFirestore.createdAt;
    } else if (reviewDataFromFirestore.createdAt && 'toDate' in reviewDataFromFirestore.createdAt) {
        createdAtString = (reviewDataFromFirestore.createdAt as Timestamp).toDate().toISOString();
    } else {
        // Fallback or error if createdAt is in an unexpected format
        console.warn(`Review ${reviewId} for app ${appId} has unexpected createdAt format.`);
        createdAtString = new Date().toISOString(); // Or throw an error
    }

    let replyObject = null;
    if (reviewDataFromFirestore.reply) {
        let replyCreatedAtString: string;
        if (typeof reviewDataFromFirestore.reply.createdAt === 'string') {
            replyCreatedAtString = reviewDataFromFirestore.reply.createdAt;
        } else if (reviewDataFromFirestore.reply.createdAt && 'toDate' in reviewDataFromFirestore.reply.createdAt) {
            replyCreatedAtString = (reviewDataFromFirestore.reply.createdAt as Timestamp).toDate().toISOString();
        } else {
            console.warn(`Review ${reviewId} for app ${appId} reply has unexpected createdAt format.`);
            replyCreatedAtString = new Date().toISOString(); // Or throw an error
        }
        replyObject = {
            body: reviewDataFromFirestore.reply.body,
            createdAt: replyCreatedAtString,
        };
    }


    const review: Review = {
      ...reviewDataFromFirestore,
      id: reviewDoc.id, // Add the document ID
      appId: appId, // Ensure appId from query is used
      createdAt: createdAtString,
      reply: replyObject,
    };

    return {
      review,
    };
  } catch (error: unknown) {
    console.error(`Error fetching review ${reviewId} for app ${appId}:`, error);
    // Check if it's an error with statusCode (likely from createError)
    if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error; // Re-throw H3 errors
    }
    // For other errors, return a generic 500
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch review details.',
    });
  }
});