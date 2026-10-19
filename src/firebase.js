import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
export const firebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId && import.meta.env.VITE_FIREBASE_ENABLED === 'true');
export const auth = firebaseConfigured ? getAuth(getApps().length ? getApps()[0] : initializeApp(config)) : null;