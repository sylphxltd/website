import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { useRuntimeConfig } from '#imports';
import { readFileSync, existsSync } from 'node:fs';

// 單例實例
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;
let appInitialized = false;

/**
 * 初始化 Firebase Admin SDK
 */
function initializeAdminApp() {
  // 如果已經初始化過，直接返回
  if (appInitialized) {
    return;
  }
  
  console.log('Initializing Firebase Admin SDK...');
  
  try {
    // 獲取 Nuxt 運行時配置
    const config = useRuntimeConfig();
    
    // 從 runtime config 獲取 GOOGLE_APPLICATION_CREDENTIALS 
    const googleAppCreds = config.googleApplicationCredentials;
    
    if (!googleAppCreds) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS not set in runtimeConfig');
    }
    
    let serviceAccount: ServiceAccount;
    
    // 透過檢查首個字符是否為 '{' 來判斷是否為 JSON 字符串
    if (googleAppCreds.toString().trim().startsWith('{')) {
      // 看起來是 JSON 字符串
      try {
        serviceAccount = JSON.parse(googleAppCreds.toString()) as ServiceAccount;
        console.log('Using service account JSON from GOOGLE_APPLICATION_CREDENTIALS');
      } catch (parseError) {
        throw new Error(`Failed to parse GOOGLE_APPLICATION_CREDENTIALS as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    } else {
      // 看起來是文件路徑
      const credPath = googleAppCreds.toString();
      console.log(`Checking service account file at path: ${credPath}`);
      
      if (!existsSync(credPath)) {
        throw new Error(`Service account file not found at path: ${credPath}`);
      }
      
      try {
        // 讀取文件內容
        const fileContent = readFileSync(credPath, 'utf8');
        serviceAccount = JSON.parse(fileContent) as ServiceAccount;
        console.log('Using service account from file content');
      } catch (fileError) {
        throw new Error(`Failed to read or parse service account file: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
      }
    }
    
    // 使用服務帳戶初始化 app
    // 注意: 這裡我們直接初始化而不先檢查現有的 apps
    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    
    // 初始化 auth 和 firestore 實例
    adminAuthInstance = getAuth(app);
    adminDbInstance = getFirestore(app);
    appInitialized = true;
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    
    const errorMessage = `Firebase Admin SDK initialization failed: ${error instanceof Error ? error.message : String(error)}
    
    Please make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly:
    
    1. For a service account file path:
       GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
       
    2. For a JSON string (ensure it's properly quoted):
       GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account","project_id":"...",...}'
    
    Note for JSON string: Make sure the entire JSON is properly escaped and quoted in your environment variable.`;
    
    throw new Error(errorMessage);
  }
}

/**
 * 獲取 Firebase Admin Auth 實例
 */
export function getAdminAuth(): Auth {
  if (!appInitialized || !adminAuthInstance) {
    initializeAdminApp();
  }
  
  if (!adminAuthInstance) {
    throw new Error("Failed to get adminAuth instance after initialization attempt");
  }
  
  return adminAuthInstance;
}

/**
 * 獲取 Firebase Admin Firestore 實例
 */
export function getAdminDb(): Firestore {
  if (!appInitialized || !adminDbInstance) {
    initializeAdminApp();
  }
  
  if (!adminDbInstance) {
    throw new Error("Failed to get adminDb instance after initialization attempt");
  }
  
  return adminDbInstance;
}