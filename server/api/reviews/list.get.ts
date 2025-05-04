import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';

// Mock Review Data Interface
interface MockReview {
  id: string;
  userName: string;
  rating: number; // 1-5
  title?: string;
  text: string;
  timestamp: string; // ISO string
  store: 'googlePlay' | 'appStore';
  appId: string; // Package name or App Store ID
}

// Mock Data Generator
const generateMockReviews = (appId: string, store: 'googlePlay' | 'appStore', count: number): MockReview[] => {
  const reviews: MockReview[] = [];
  const users = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
  const titles = ['Great App!', 'Needs Improvement', 'Love it!', 'Buggy', 'Okay'];
  const texts = [
    'This app is fantastic, does exactly what I need.',
    'Constantly crashing on my device, please fix.',
    'Simple and easy to use, highly recommend.',
    'The latest update introduced some annoying bugs.',
    'It works, but the UI could be better.',
    'Best app in its category!',
  ];

  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date in last 30 days
    reviews.push({
      id: `${store}-${appId}-${i}-${Date.now()}`,
      userName: users[Math.floor(Math.random() * users.length)],
      rating: Math.floor(Math.random() * 5) + 1,
      title: titles[Math.floor(Math.random() * titles.length)],
      text: texts[Math.floor(Math.random() * texts.length)],
      timestamp: date.toISOString(),
      store: store,
      appId: appId,
    });
  }
  return reviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort newest first
};


export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth();

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

  // 2. Get Query Parameters (App ID and Store)
  const query = getQuery(event);
  const appId = query.appId as string;
  const store = query.store as ('googlePlay' | 'appStore' | undefined);

  if (!appId || !store) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId or store query parameter.' });
  }
   if (store !== 'googlePlay' && store !== 'appStore') {
       throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid store parameter. Use "googlePlay" or "appStore".' });
   }


  // 3. Simulate API Call / Return Mock Data
  console.log(`Simulating fetching reviews for ${store} app: ${appId}`);
  // In a real scenario, you would call the respective store API here.
  // For now, return mock data.
  const mockReviews = generateMockReviews(appId, store, 15); // Generate 15 mock reviews

  return { reviews: mockReviews };
});