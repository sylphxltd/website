// setAdmin.cjs
// Load environment variables from .env file first
require('dotenv').config();

const admin = require('firebase-admin');

// Initialize admin SDK (reads GOOGLE_APPLICATION_CREDENTIALS from process.env, now populated by dotenv)
let initialized = false;
let initError = null; // Store potential errors

// Check if GOOGLE_APPLICATION_CREDENTIALS exists
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
}

// Priority 1: Try parsing GOOGLE_APPLICATION_CREDENTIALS as JSON content
try {
    console.log("Attempting to initialize Admin SDK by parsing JSON content...");
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Admin SDK initialized from JSON content.");
    initialized = true;
} catch (parseError) {
    console.warn(`Parsing JSON content failed: ${parseError instanceof Error ? parseError.message : parseError}. Falling back to ADC...`);
    initError = parseError; // Store the parsing error

    // Priority 2: Try standard Application Default Credentials (ADC)
    try {
        console.log("Attempting to initialize Admin SDK using ADC...");
        // Check if already initialized by the failed JSON parse attempt (unlikely but possible)
        if (!admin.apps || !admin.apps.length) {
             admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
            console.log("Admin SDK initialized using ADC.");
            initialized = true;
            initError = null; // Clear previous error if ADC succeeded
        } else {
             console.log("Admin SDK already initialized (likely via failed JSON parse attempt).");
             initialized = true; // Assume initialized if apps exist
             initError = null; // Clear previous error
        }
    } catch (adcError) {
        console.error("ADC initialization also failed:", adcError);
        initError = initError || adcError; // Keep the first error encountered
    }
}

if (!initialized) {
    console.error(`Could not initialize Firebase Admin SDK. Last error: ${initError instanceof Error ? initError.message : initError}`);
    process.exit(1);
}


// --- User UID ---
const uid = 'C8BBXpis0Of9IgPr3OVKY9yGqgq2';
// ----------------

console.log(`Attempting to set admin claim for user: ${uid}`);

admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
        console.log(`Successfully set admin claim for user: ${uid}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error(`Error setting custom claims for user ${uid}:`, error);
        process.exit(1);
    });