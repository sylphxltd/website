import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import type {
  // Import types from firebase-admin/firestore
  Query,
  DocumentData,
  DocumentSnapshot,
  Timestamp, // Import Timestamp for date conversion
} from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin';
import type { Application } from '~/stores/apps';

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
  const pageSize = Number.parseInt(queryParams.limit?.toString() || '10', 10);
  const search = queryParams.search?.toString().toLowerCase() || '';
  const platform = queryParams.platform?.toString() || '';
  const status = queryParams.status?.toString() || '';
  const afterCursor = queryParams.cursor?.toString() || null; // Expecting cursor ID

  // 3. Firestore Query Construction using Admin SDK
  const db = getAdminDb();
  let appsQuery: Query<DocumentData> = db.collection("apps"); // Use db.collection

  // Add filtering constraints
  if (status) {
      appsQuery = appsQuery.where("status", "==", status);
  }
  if (platform) {
      appsQuery = appsQuery.where("platforms", "array-contains", platform);
  }
  // Basic name search
  if (search) {
      appsQuery = appsQuery.where("name", ">=", search);
      appsQuery = appsQuery.where("name", "<=", `${search}\uf8ff`);
      appsQuery = appsQuery.orderBy("name", "asc"); // Order by name when searching
  } else {
      // Default sort order
      appsQuery = appsQuery.orderBy("updatedAt", "desc");
  }

  // 4. Get Total Count - Apply only filtering constraints
  let total = 0;
  try {
      let countQuery: Query<DocumentData> = db.collection("apps");
      if (status) countQuery = countQuery.where("status", "==", status);
      if (platform) countQuery = countQuery.where("platforms", "array-contains", platform);
      if (search) {
          countQuery = countQuery.where("name", ">=", search);
          countQuery = countQuery.where("name", "<=", `${search}\uf8ff`);
      }
      const snapshot = await countQuery.count().get(); // Use count().get()
      total = snapshot.data().count;
  } catch (countError) {
      console.error("Error getting app count:", countError);
      // Proceed without total count if it fails
  }

  // 5. Handle Cursor for Pagination
  if (afterCursor) {
      try {
          const cursorRef = db.collection("apps").doc(afterCursor); // Use db.collection().doc()
          const cursorDoc = await cursorRef.get(); // Use docRef.get()
          if (cursorDoc.exists) {
              appsQuery = appsQuery.startAfter(cursorDoc); // Use startAfter directly on the query
          } else {
              console.warn(`Cursor document with ID ${afterCursor} not found. Fetching from beginning.`);
          }
      } catch (cursorError) {
          console.error(`Error fetching cursor document ${afterCursor}:`, cursorError);
          // Fetch from beginning if cursor is invalid
      }
  }

  // Add limit constraint AFTER potential startAfter constraint
  appsQuery = appsQuery.limit(pageSize); // Use limit directly on the query

  // 6. Get Paginated Data
  try {
    const querySnapshot = await appsQuery.get(); // Use query.get()

    const appsData = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        // Helper to convert Admin SDK Timestamp to ISO string safely
        const toISOStringSafe = (timestamp: Timestamp | undefined | null): string => {
            try {
                return timestamp?.toDate().toISOString() || new Date(0).toISOString();
            } catch {
                return new Date(0).toISOString(); // Fallback for invalid timestamps
            }
        };

        return {
          id: docSnapshot.id,
          name: data.name || 'Unnamed App',
          description: data.description,
          links: data.links || {},
          logoUrl: data.logoUrl,
          createdAt: toISOStringSafe(data.createdAt),
          updatedAt: toISOStringSafe(data.updatedAt),
          platforms: data.platforms || [],
          status: data.status || 'draft',
          appId: data.appId,
          tags: data.tags || [],
          features: data.features || [],
          screenshotUrls: data.screenshotUrls || [],
          downloads: data.downloads || 0,
          rating: data.rating || 0,
        } as Application;
    });

    // Determine the next cursor
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextPageCursor = lastVisibleDoc ? lastVisibleDoc.id : null;

    return {
      apps: appsData,
      total: total,
      nextPageCursor: nextPageCursor
    };

  } catch (error) {
    console.error("Error fetching apps from Firestore:", error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching apps' });
  }
});