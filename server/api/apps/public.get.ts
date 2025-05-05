import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import type {
  Query,
  DocumentData,
  DocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';
import { getAdminDb } from '~/server/utils/firebaseAdmin'; // Only need DB access
import type { Application } from '~/stores/apps';

export default defineEventHandler(async (event: H3Event) => {
  // No Authorization Check needed for public endpoint

  // 2. Get Query Parameters (Optional: Add filters like category/tag later)
  const queryParams = getQuery(event);
  // Basic pagination (optional, can be added later if needed)
  // const pageSize = Number.parseInt(queryParams.limit?.toString() || '20', 10); // Example page size
  // const afterCursor = queryParams.cursor?.toString() || null;
  // const category = queryParams.category?.toString() || ''; // Example filter

  // 3. Firestore Query Construction using Admin SDK
  const db = getAdminDb();
  let appsQuery: Query<DocumentData> = db.collection("apps");

  // **Crucial Filter: Only fetch 'active' apps**
  appsQuery = appsQuery.where("status", "==", "active");

  // Add other public filters if needed (e.g., category)
  // if (category) {
  //     appsQuery = appsQuery.where("publicCategories", "array-contains", category); // Assuming a dedicated public category field
  // }

  // Default sort order for public display (e.g., by creation date or name)
  appsQuery = appsQuery.orderBy("createdAt", "desc"); // Or orderBy("name", "asc")

  // Add pagination constraints if implemented
  // if (afterCursor) { ... }
  // appsQuery = appsQuery.limit(pageSize);

  // 4. Get Data
  try {
    const querySnapshot = await appsQuery.get();

    const appsData = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const toISOStringSafe = (timestamp: Timestamp | undefined | null): string => {
            try { return timestamp?.toDate().toISOString() || new Date(0).toISOString(); }
            catch { return new Date(0).toISOString(); }
        };

        // Return only necessary public fields
        return {
          id: docSnapshot.id,
          name: data.name || 'Unnamed App',
          description: data.description,
          links: data.links || {}, // Filter sensitive links if needed later
          logoUrl: data.logoUrl,
          createdAt: toISOStringSafe(data.createdAt),
          updatedAt: toISOStringSafe(data.updatedAt), // Maybe not needed for public view?
          platforms: data.platforms || [],
          status: data.status, // Should always be 'active' based on query
          appId: data.appId,
          tags: data.tags || [],
          features: data.features || [], // Maybe only show key features?
          screenshotUrls: data.screenshotUrls || [],
          // Exclude sensitive or unnecessary fields like downloads, rating?
        } as Partial<Application>; // Use Partial if returning fewer fields
    });

    // Add pagination info if implemented
    // const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    // const nextPageCursor = lastVisibleDoc ? lastVisibleDoc.id : null;

    return {
      apps: appsData,
      // nextPageCursor: nextPageCursor // If pagination is added
      // total: appsData.length // Total might not be needed or accurate without count query
    };

  } catch (error) {
    console.error("Error fetching public apps from Firestore:", error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching applications' });
  }
});