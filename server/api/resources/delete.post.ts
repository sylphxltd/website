import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';

interface DeleteBody {
    filePath: string; // Full path to the file in storage, e.g., appResources/appId123/image.png
}

export default defineEventHandler(async (event: H3Event) => {
    const adminAuth = getAdminAuth();
    const storage = getStorage();
    const bucket = storage.bucket();

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
    const body = await readBody<DeleteBody>(event);
    if (!body || !body.filePath) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing filePath in request body.' });
    }

    // Basic validation to ensure it's likely within the allowed path
    if (!body.filePath.startsWith('appResources/')) {
         throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid file path.' });
    }

    // 3. Delete File from Firebase Storage
    try {
        const file = bucket.file(body.filePath);
        await file.delete();

        console.log(`Successfully deleted ${body.filePath}`);
        return { success: true, message: 'File deleted successfully.' };

    } catch (error: unknown) { // Use unknown type
        console.error(`Error deleting file ${body.filePath}:`, error);
        // Check for specific errors like 'object not found' after type checking
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 404) {
             throw createError({ statusCode: 404, statusMessage: 'File not found.' });
        }
        // You might want to log the actual error message for debugging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw createError({ statusCode: 500, statusMessage: `Failed to delete file: ${errorMessage}` });
    }
});