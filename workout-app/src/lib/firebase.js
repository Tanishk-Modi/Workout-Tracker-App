    // src/lib/firebase.js
    import { initializeApp } from "firebase/app";
    import { getFirestore } from "firebase/firestore";
    import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth";

    // Access Firebase config from environment variables
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
    };

    // --- TEMPORARY DEBUG LOG ---
    // This will help you verify that the correct config values are being loaded.
    // REMOVE THIS LINE AFTER YOU CONFIRM IT'S WORKING!
    console.log("Firebase Config loaded in firebase.js:", firebaseConfig);
    // --- END TEMPORARY DEBUG LOG ---

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    // Handle initial authentication token
    const initAuth = async () => {
      // __initial_auth_token is provided by the specific environment, not from .env
      const initialAuthToken = import.meta.env.__initial_auth_token;

      if (initialAuthToken) {
        try {
          await signInWithCustomToken(auth, initialAuthToken);
          console.log("Signed in with custom token!");
        } catch (error) {
          console.error("Error signing in with custom token:", error);
          await signInAnonymously(auth);
          console.log("Signed in anonymously as fallback.");
        }
      } else {
        try {
          await signInAnonymously(auth);
          console.log("Signed in anonymously (no custom token).");
        } catch (error) {
          console.error("Error signing in anonymously:", error);
        }
      }
    };

    initAuth();

    export { db, auth, app };