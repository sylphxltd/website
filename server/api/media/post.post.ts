import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

// Define the expected request body structure
interface MediaPostBody {
  title: string;
  content: string; // Main content (e.g., for Medium)
  platforms: ('medium' | 'x' | 'facebook')[]; // Platforms to post to
  // Add other fields like image URLs, tags etc. later
}

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth();
  const config = useRuntimeConfig(); // To potentially access API keys later

  // 1. Authentication and Authorization Check
  const authorization = getHeader(event, 'Authorization');
   if (!authorization || !authorization.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Missing Bearer token' });
  }
  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
    }
  } catch (error) {
    console.error("Error verifying admin token:", error);
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. Read and Validate Request Body
  const body = await readBody<MediaPostBody>(event);
  if (!body || !body.title || !body.content || !body.platforms || body.platforms.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing title, content, or platforms.' });
  }

  // 3. Simulate Posting to Platforms
  const results: { platform: string; success: boolean; message: string }[] = [];

  for (const platform of body.platforms) {
    console.log(`Simulating post to ${platform}...`);
    // --- Placeholder for actual API calls ---
    // const apiKey = config[`${platform}ApiKey`]; // Example: Get platform-specific key
    // if (!apiKey) {
    //   results.push({ platform, success: false, message: `${platform} API key not configured.` });
    //   continue;
    // }
    try {
      // Get token once for potential AI calls
      const auth = getAdminAuth(); // Re-use admin auth instance
      const idTokenForAICalls = await auth.verifyIdToken(idToken); // Already verified, but get payload if needed

      switch (platform) {
        case 'medium': {
          // TODO: Implement Medium API call
          console.log(`  Title: ${body.title}`);
          console.log(`  Content: ${body.content.substring(0, 100)}...`);
          results.push({ platform, success: true, message: 'Simulated post to Medium successful.' });
          break;
        }
        case 'x': {
          // Generate content using AI
          let generatedTweet = 'Error generating content for X.'; // Use plain string
          try {
              const aiResponse = await $fetch<{ generatedContent: string }>('/api/ai/generate-social-post', {
                  method: 'POST',
                  headers: {
                      'Authorization': `Bearer ${idToken}`, // Pass token
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      originalContent: body.content,
                      targetPlatform: 'x',
                      title: body.title
                  })
              });
              generatedTweet = aiResponse.generatedContent;
          } catch (aiError) {
              console.error("AI generation error for X:", aiError);
          }
          // TODO: Implement X (Twitter) API call with generatedTweet
          console.log(`  Tweet (AI Generated): ${generatedTweet}`);
          results.push({ platform, success: true, message: 'Simulated post to X successful (used AI content).' });
          break;
        }
        case 'facebook': {
           // Generate content using AI
          let generatedFbPost = 'Error generating content for Facebook.'; // Use plain string
           try {
              const aiResponse = await $fetch<{ generatedContent: string }>('/api/ai/generate-social-post', {
                  method: 'POST',
                  headers: {
                      'Authorization': `Bearer ${idToken}`, // Pass token
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      originalContent: body.content,
                      targetPlatform: 'facebook',
                      title: body.title
                  })
              });
              generatedFbPost = aiResponse.generatedContent;
          } catch (aiError) {
              console.error("AI generation error for Facebook:", aiError);
          }
          // TODO: Implement Facebook Graph API call with generatedFbPost
          console.log(`  FB Post (AI Generated): ${generatedFbPost}`);
          results.push({ platform, success: true, message: 'Simulated post to Facebook successful (used AI content).' });
          break;
        }
        default: {
          results.push({ platform, success: false, message: `Platform ${platform} not supported.` });
        }
      }
      // Simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error simulating post to ${platform}:`, error);
        results.push({ platform, success: false, message: `Failed to post to ${platform}: ${message}` });
    }
    // --- End Placeholder ---
  }

  // 4. Return aggregated results
  const overallSuccess = results.every(r => r.success);
  return {
      success: overallSuccess,
      message: overallSuccess ? 'Posts submitted successfully (simulated).' : 'Some posts failed (simulated).',
      results: results
  };
});