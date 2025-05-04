import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore'; // Import Firestore admin SDK

// Define Email interface based on Firestore data structure (matching Worker output)
interface FirestoreEmail {
  id: string; // Firestore document ID
  to: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO Timestamp string
  headers?: string; // JSON string of headers
  status: 'received' | 'replied' | 'archived' | string; // Example statuses
}

export default defineEventHandler(async (event: H3Event) => {
  const adminAuth = getAdminAuth();
  const db = getFirestore(); // Get Firestore instance from admin SDK

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

  // 2. Fetch Emails from Firestore
  try {
    const emailsCollection = db.collection('emails'); // Assuming 'emails' collection
    // Add ordering and potentially filtering/pagination
    const q = emailsCollection.orderBy('receivedAt', 'desc').limit(50); // Get latest 50
    const snapshot = await q.get();

    if (snapshot.empty) {
      return { emails: [] };
    }

    const emails: FirestoreEmail[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            to: data.to || '',
            from: data.from || '',
            subject: data.subject || '',
            body: data.body || '',
            // Convert Firestore Timestamp to ISO string if needed, otherwise use stored string
            receivedAt: data.receivedAt?.toDate ? data.receivedAt.toDate().toISOString() : (data.receivedAt || ''),
            headers: data.headers, // Keep as JSON string or parse if needed
            status: data.status || 'received',
        } as FirestoreEmail; // Cast needed if data structure isn't strictly enforced
    });

    return { emails };

  } catch (error) {
      console.error("Error fetching emails from Firestore:", error);
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch emails.' });
  }
});