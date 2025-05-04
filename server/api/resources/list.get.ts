import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage'; // Import Storage admin SDK

interface StorageFile {
    name: string;
    path: string;
    size: number;
    updated: string;
    // downloadUrl?: string; // Generating download URLs might require extra steps/permissions
}

export default defineEventHandler(async (event: H3Event) => {
    const adminAuth = getAdminAuth();
    const storage = getStorage(); // Get Storage instance from admin SDK
    const bucket = storage.bucket(); // Default bucket

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

    // 2. Get Query Parameter (appId)
    const query = getQuery(event);
    const appId = query.appId as string;

    if (!appId) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId query parameter.' });
    }

    // 3. List Files in Firebase Storage
    try {
        const prefix = `appResources/${appId}/`;
        const [files] = await bucket.getFiles({ prefix: prefix });

        const fileList: StorageFile[] = files
            // Filter out potential "directory" objects if prefix listing includes them
            .filter(file => !file.name.endsWith('/'))
            .map(file => ({
                name: file.name.substring(prefix.length), // Get filename without prefix
                path: file.name,
                size: Number.parseInt(file.metadata.size as string || '0', 10), // Use Number.parseInt
                updated: file.metadata.updated as string,
            }));

        return { files: fileList };

    } catch (error) {
        console.error(`Error listing files for appId ${appId}:`, error);
        throw createError({ statusCode: 500, statusMessage: 'Failed to list resources.' });
    }
});