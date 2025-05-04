import type { H3Event } from 'h3';
import { getAdminAuth } from '~/server/utils/firebaseAdmin';
import { getStorage } from 'firebase-admin/storage';
import { readMultipartFormData } from 'h3'; // Nitro utility for form data
import type { DecodedIdToken } from 'firebase-admin/auth'; // Import the type

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

    let isAdmin = false;
    let decodedTokenPayload: DecodedIdToken | undefined; // Add type annotation
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken.admin) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden: User is not an admin' });
        }
        isAdmin = true; // Set flag if admin check passes
        decodedTokenPayload = decodedToken; // Store payload
    } catch (error) {
        console.error("Error verifying admin token:", error);
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Invalid token' });
    }

    // Ensure admin check passed before proceeding
    if (!isAdmin) {
         throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin privileges required.' });
    }


    // 2. Read Multipart Form Data
    const formData = await readMultipartFormData(event);
    if (!formData) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Invalid form data.' });
    }

    const appIdPart = formData.find(part => part.name === 'appId');
    const filePart = formData.find(part => part.name === 'file' && part.filename);

    if (!appIdPart || !filePart || !filePart.data || !filePart.filename) {
        throw createError({ statusCode: 400, statusMessage: 'Bad Request: Missing appId or file in form data.' });
    }

    const appId = appIdPart.data.toString('utf-8'); // Assuming appId is sent as text
    // Sanitize filename to prevent path traversal or invalid characters
    const originalFileName = filePart.filename;
    const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_'); // Replace unsafe chars with underscore
    const fileBuffer = filePart.data;
    const fileType = filePart.type; // Get MIME type

    // Construct the storage path
    const filePath = `appResources/${appId}/${safeFileName}`; // Use sanitized filename

    // 3. Upload File to Firebase Storage
    try {
        const file = bucket.file(filePath);

        // Create a write stream and upload the buffer
        const stream = file.createWriteStream({
            metadata: {
                contentType: fileType, // Set the MIME type
                // You can add custom metadata here if needed
                customMetadata: { uploadedBy: decodedTokenPayload?.uid || 'unknown' } // Use stored payload safely
            },
            // Make the file publicly readable if needed, otherwise rely on signed URLs or rules
            // public: true,
            // resumable: false // Consider resumable for large files
        });

        // Use a promise to handle stream events
        await new Promise((resolve, reject) => {
            stream.on('error', (err) => {
                console.error(`Error uploading ${safeFileName}:`, err);
                reject(createError({ statusCode: 500, statusMessage: 'Failed to upload file.' }));
            });
            stream.on('finish', () => {
                console.log(`Successfully uploaded ${safeFileName} to ${filePath}`);
                resolve(true);
            });
            stream.end(fileBuffer); // Write the buffer to the stream
        });

        // Optionally, get metadata or a download URL after upload
        // const [metadata] = await file.getMetadata();
        // const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' }); // Example signed URL

        return { success: true, message: 'File uploaded successfully.', filePath: filePath, fileName: safeFileName }; // Return safe name too

    } catch (error: unknown) {
        // Catch errors from the promise or other operations
        console.error(`Error processing upload for ${safeFileName}:`, error);
        if (error instanceof Error && 'statusCode' in error) {
             throw error; // Re-throw H3 errors
        }
        throw createError({ statusCode: 500, statusMessage: 'File upload failed.' });
    }
});