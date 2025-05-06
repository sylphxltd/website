import type { H3Event } from 'h3';
import { readBody } from 'h3';
import { getAdminAuth, getAdminDb } from '~/server/utils/firebaseAdmin'; // Import getAdminDb
// TODO: Import necessary SDKs/clients for Medium, X, Facebook, etc.

// Define the structure for content specific to a platform
interface PlatformSpecificContent {
  title?: string; // Optional title
  body: string;   // Required body content
  tags?: string[]; // Optional tags
}

// Define the new request body structure
interface PostRequestBody {
  finalContent: Record<string, PlatformSpecificContent>; // Platform ID -> Content
}

export default defineEventHandler(async (event: H3Event) => {
  // 1. Authorization Check (Admin Only)
  const authorization = getHeader(event, 'Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];
  let adminUid: string; // Declare adminUid in a higher scope

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    adminUid = decodedToken.uid; // Assign adminUid here
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error) {
     console.error("Error verifying admin token:", error);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. Read Request Body
  const body = await readBody<PostRequestBody>(event);
  // Validate the new structure
  if (!body || typeof body.finalContent !== 'object' || Object.keys(body.finalContent).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing or invalid finalContent object' });
  }

  const { finalContent } = body;

  // 3. Iterate through platform-specific content and "publish" (log)
  const results: Record<string, { success: boolean; message?: string; error?: string }> = {};
  try {
    // Process each platform entry in finalContent
    for (const [platformId, contentToPublish] of Object.entries(finalContent)) { // Renamed 'content' to 'contentToPublish' for clarity
      try {
        // Basic validation for the content object for this platform
        if (!contentToPublish || typeof contentToPublish.body !== 'string' || contentToPublish.body.trim() === '') {
           console.warn(`Skipping platform ${platformId}: Invalid or missing body content.`);
           results[platformId] = { success: false, error: `Invalid or missing body content for ${platformId}.` };
           continue; // Skip to the next platform
        }

        if (platformId === 'medium') {
          console.log("Attempting to publish to Medium...");
          let mediumIntegrationToken: string | undefined;
          let mediumUserId: string | undefined;

          try {
            const firestoreDb = getAdminDb(); // Get Firestore instance
            const docRef = firestoreDb.collection('media_connections').doc(adminUid);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
              const data = docSnap.data();
              // biome-ignore lint/style/noNonNullAssertion: We check for existence before accessing
              if (data?.medium?.integrationToken && data?.medium?.userId) {
                mediumIntegrationToken = data.medium.integrationToken;
                mediumUserId = data.medium.userId;
                console.log(`Successfully fetched Medium credentials for user ${adminUid}`);
              } else {
                console.warn(`Medium connection details (token or userId) missing in Firestore for user ${adminUid}. Skipping Medium publish.`);
                results[platformId] = { success: false, error: "Medium connection details incomplete in Firestore." };
                continue;
              }
            } else {
              console.warn(`Medium connection document not found in Firestore for user ${adminUid}. Skipping Medium publish.`);
              results[platformId] = { success: false, error: "Medium connection details not found for this user." };
              continue;
            }
          } catch (error) {
            console.error(`Error fetching Medium connection details from Firestore for user ${adminUid}:`, error);
            results[platformId] = { success: false, error: "Failed to retrieve Medium credentials from Firestore." };
            continue;
          }

          // Check if tokens were successfully retrieved
          if (!mediumIntegrationToken || !mediumUserId) {
            // This case should ideally be caught by the logic above, but as a safeguard:
            console.error("Medium integration token or User ID was not populated after Firestore check. Skipping Medium publish.");
            results[platformId] = { success: false, error: "Medium credentials could not be loaded." };
            continue;
          }

          try {
            const mediumApiUrl = `https://api.medium.com/v1/users/${mediumUserId}/posts`;
            const mediumPayload = {
              title: contentToPublish.title || "Untitled Post", // Medium requires a title
              contentFormat: "markdown", // Assuming body is Markdown from Milkdown
              content: contentToPublish.body,
              tags: contentToPublish.tags || [], // Optional
              publishStatus: "public" // Or "draft" / "unlisted" as needed
            };

            console.log(`Calling Medium API for platform ${platformId}: URL: ${mediumApiUrl}, Payload:`, mediumPayload);

            // @ts-ignore $fetch is globally available in Nuxt 3 server routes
            const mediumResponse = await $fetch(mediumApiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${mediumIntegrationToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8'
              },
              body: mediumPayload
            });

            // @ts-ignore
            console.log(`Successfully published to Medium for platform ${platformId}, post ID: ${mediumResponse.data.id}`);
            // @ts-ignore
            results[platformId] = { success: true, message: `Successfully published to Medium. Post ID: ${mediumResponse.data.id}` };
          } catch (error) {
            console.error(`Failed to publish to Medium for platform ${platformId}: `, error);
            // @ts-ignore
            results[platformId] = { success: false, error: `Failed to publish to Medium: ${error.message || 'Unknown error'}` };
          }
        } else {
          // **Placeholder:** Log the publishing action for other platforms
          console.log(`Publishing to ${platformId}:`, {
              title: contentToPublish.title,
              bodyLength: contentToPublish.body.length,
              tags: contentToPublish.tags
          });
          // Simulate async operation if needed
          // await new Promise(resolve => setTimeout(resolve, 100));
          results[platformId] = { success: true, message: `Successfully processed post for ${platformId} (logged).` };
        }
      } catch (platformError) {
         console.error(`Error processing post for ${platformId}:`, platformError);
         // @ts-ignore
         results[platformId] = { success: false, error: `Failed to process post for ${platformId}: ${platformError.message || 'Unknown error'}` };
      }
    }

    return { success: true, results };

  } catch (error) {
    console.error("Error during media post process:", error);
     // Check if it's already an H3 error
    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        throw error;
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error during publishing' });
  }
});