// EmptyHands student app — settings. See app/SETUP.md.

// 1. Your Firebase web app config (Firebase console → Project settings → General → Your apps).
//    While apiKey is empty the app runs in DEMO MODE: accounts and notices are kept
//    only in the browser you're using, so nothing is shared between devices.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

// 2. Head coaches. These emails can always open the coach panel (after verifying
//    their email) and can add other coaches from it. Keep this list identical to
//    OWNERS in app/firestore.rules.
export const OWNER_EMAILS = ['info@emptyhands.co.uk'];
