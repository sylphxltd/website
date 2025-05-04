import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  // startAfter, // Not used in current simplified pagination
  where,
  getCountFromServer,
  // Import types separately
  type Query,
  type DocumentData,
  type QueryConstraint,
  // type DocumentSnapshot // Not used currently
} from 'firebase/firestore';
// import { useFirestore } from 'vuefire/server'; // REMOVED
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin'; // Import getAdminDb
import type { Application } from '~/stores/apps';

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check (Same as other admin endpoints)
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
  const page = Number.parseInt(queryParams.page?.toString() || '1', 10);
  const pageSize = Number.parseInt(queryParams.limit?.toString() || '10', 10);
  const search = queryParams.search?.toString().toLowerCase() || '';
  const platform = queryParams.platform?.toString() || '';
  const status = queryParams.status?.toString() || ''; // 'active', 'draft', 'archived'

  // 3. Firestore Query Construction
  const db = getAdminDb(); // Use getAdminDb()
  const appsCollection = collection(db, "apps");
  const constraints: QueryConstraint[] = [];

  // Add filtering constraints
  // NOTE: Firestore requires composite indexes for multiple inequality/orderBy clauses.
  // Text search is limited. For robust search, consider Algolia/Typesense/Meilisearch.
  if (status) {
      // Assuming 'status' field exists in Firestore documents
      constraints.push(where("status", "==", status)); 
  }
  if (platform) {
      // Assuming 'platforms' is an array field in Firestore
      constraints.push(where("platforms", "array-contains", platform)); 
  }
  // Basic name search (case-sensitive prefix match - limited)
  if (search) {
      constraints.push(where("name", ">=", search));
      constraints.push(where("name", "<=", `${search}\uf8ff`)); // Use template literal
      // Add orderBy('name') if using range filters on name
      constraints.push(orderBy("name"));
  } else {
      // Default sort order if not searching by name
      constraints.push(orderBy("updatedAt", "desc")); 
  }

  // 4. Get Total Count (for pagination info) - Runs a separate query
  let total = 0;
  try {
      // Apply only filtering constraints for count
      const countQuery = query(appsCollection, ...constraints.filter(c => c.type !== 'orderBy' && c.type !== 'limit' && c.type !== 'startAfter'));
      const snapshot = await getCountFromServer(countQuery);
      total = snapshot.data().count;
  } catch (countError) {
      console.error("Error getting app count:", countError);
      // Proceed without total count if it fails
  }

  // 5. Get Paginated Data
  // Firestore pagination typically uses cursors (startAfter). 
  // Mapping page numbers to cursors requires fetching intermediate docs or storing cursors.
  // Simplification: Using offset/limit for now, less efficient for large datasets.
  // For better performance, implement cursor-based pagination.
  const offset = (page - 1) * pageSize; 
  // Note: Firestore doesn't have a direct 'offset'. We'll fetch docs up to the offset+limit 
  // and slice, which is inefficient. Cursor-based is preferred.
  
  // Add limit constraint
  constraints.push(firestoreLimit(pageSize)); 
  
  // TODO: Implement proper cursor-based pagination instead of offset.
  // If using offset: Need to fetch `offset + pageSize` and slice, or fetch previous page cursors.
  
  // For now, just fetch the first page based on filters/order
  const finalQuery = query(appsCollection, ...constraints);

  try {
    const querySnapshot = await getDocs(finalQuery);
    
    const appsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed App',
          description: data.description,
          links: data.links || {},
          logoUrl: data.logoUrl,
          createdAt: data.createdAt?.toDate().toISOString() || new Date(0).toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date(0).toISOString(),
          platforms: data.platforms || [],
          status: data.status || 'draft',
          appId: data.appId,
          tags: data.tags || [], // Fetch tags
          features: data.features || [], // Fetch features
          screenshotUrls: data.screenshotUrls || [], // Fetch screenshots
          // Placeholders - remove or fetch real data later
          downloads: data.downloads || 0,
          rating: data.rating || 0,
        } as Application;
    });

    // TODO: Implement logic to get the correct cursor for the *next* page if using cursors.
    // const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { 
      apps: appsData, 
      total: total 
      // nextPageCursor: lastVisible // If using cursors
    };

  } catch (error) {
    console.error("Error fetching apps from Firestore:", error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching apps' });
  }
});