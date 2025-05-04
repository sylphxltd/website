import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import type { MediaAccount } from '~/stores/media';

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
    // TODO: In a real app, likely fetch connected accounts associated with this user/org from Firestore or a secure backend.
    const userId = decodedToken.uid; // Use this to fetch user-specific connections

  } catch (error) {
     console.error("Error verifying admin token:", error);
     throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
  }

  // 2. **Placeholder:** Return mock connected accounts
  try {
    // Simulate fetching data
    await new Promise(resolve => setTimeout(resolve, 150));

    const mockAccounts: MediaAccount[] = [
      { id: '12345_medium', platform: 'medium', name: 'SylphX Blog' },
      { id: '67890_x', platform: 'x', name: '@SylphX_Devs' },
      // { id: '11223_facebook', platform: 'facebook', name: 'SylphX Official Page' },
    ];

    return { accounts: mockAccounts };

  } catch (error) {
    console.error("Error fetching media accounts:", error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error fetching accounts' });
  }
});