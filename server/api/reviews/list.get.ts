import type { H3Event } from 'h3';
import { getQuery } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { Review } from '~/stores/reviews'; // Import type

// Mock Data Generation
const generateMockReviews = (appId: string, store: string, count: number, page: number): Review[] => {
  const reviews: Review[] = [];
  const baseId = `${appId}-${store}-p${page}-`;
  const authors = ['User A', 'Reviewer B', 'Customer C', 'Tester D', 'Gamer E'];
  // Use undefined instead of null for optional title
  const titles = [undefined, 'Great App!', 'Needs Improvement', 'Bug Found', 'Feature Request'];
  const bodies = [
    'This app is fantastic, works perfectly!',
    'Crashes frequently on my device.',
    'Could you add a dark mode feature?',
    'Easy to use and very helpful.',
    'The latest update broke the login.',
    'Love the new features, keep it up!',
    'Interface is a bit confusing.',
  ];

  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * 5) + 1;
    const hasReply = Math.random() > 0.6;
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(); // Random date in last 30 days

    reviews.push({
      id: baseId + i,
      appId: appId,
      store: store,
      author: authors[Math.floor(Math.random() * authors.length)],
      rating: rating,
      title: titles[Math.floor(Math.random() * titles.length)],
      body: bodies[Math.floor(Math.random() * bodies.length)],
      createdAt: createdAt,
      reply: hasReply ? {
        body: 'Thank you for your feedback!',
        createdAt: new Date(new Date(createdAt).getTime() + Math.random() * 1000 * 60 * 60 * 24).toISOString() // Reply within a day
      } : null,
    });
  }
  return reviews;
};


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
  const query = getQuery(event);
  const appId = query.appId?.toString();
  const store = query.store?.toString() || 'all'; // 'googlePlay', 'appStore', 'all'
  const page = Number.parseInt(query.page?.toString() || '1', 10);
  const limit = Number.parseInt(query.limit?.toString() || '10', 10);
  // Add other filters like rating, dateFrom, dateTo, hasReply if needed

  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId query parameter' });
  }

  console.log(`Fetching reviews for appId: ${appId}, store: ${store}, page: ${page}, limit: ${limit}`);

  // 3. **Placeholder:** Fetch reviews from actual store APIs or aggregation service
  // This part needs real implementation based on chosen APIs/services.
  // For now, return mock data.

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let mockReviews: Review[] = [];
    const totalMockReviews = 55; // Simulate a total count

    if (store === 'all' || store === 'googlePlay') {
        mockReviews = mockReviews.concat(generateMockReviews(appId, 'googlePlay', Math.ceil(limit / (store === 'all' ? 2 : 1)), page));
    }
     if (store === 'all' || store === 'appStore') {
        mockReviews = mockReviews.concat(generateMockReviews(appId, 'appStore', Math.floor(limit / (store === 'all' ? 2 : 1)), page));
    }

    // Simulate pagination slicing (crude version)
    const startIndex = (page - 1) * limit;
    const paginatedReviews = mockReviews.slice(startIndex, startIndex + limit);


    return {
      reviews: paginatedReviews,
      total: totalMockReviews // Return simulated total
    };

  } catch (error) {
    console.error(`Error fetching/simulating reviews for appId ${appId}:`, error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching reviews' });
  }
});