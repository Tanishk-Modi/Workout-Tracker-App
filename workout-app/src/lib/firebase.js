import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth"; // Import auth methods


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB21OtN3qRiRSzuviZntmpGGl1bjuPDL1g",
  authDomain: "workout-app-ec64f.firebaseapp.com",
  projectId: "workout-app-ec64f",
  storageBucket: "workout-app-ec64f.firebasestorage.app",
  messagingSenderId: "1015245447022",
  appId: "1:1015245447022:web:572641a2a8638b83f76b7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize authentication

// Handle initial authentication token
const initAuth = async () => {
    const initialAuthToken = import.meta.env.__initial_auth_token; // Access env var
  
    if (initialAuthToken) {
      try {
        await signInWithCustomToken(auth, initialAuthToken);
        console.log("Signed in with custom token!");
      } catch (error) {
        console.error("Error signing in with custom token:", error);
        // Fallback to anonymous if custom token fails
        await signInAnonymously(auth);
        console.log("Signed in anonymously as fallback.");
      }
    } else {
      // If no custom token, sign in anonymously for MVP
      try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously (no custom token).");
      } catch (error) {
        console.error("Error signing in anonymously:", error);
      }
    }
  };
  
  // Call initAuth when the app starts
  initAuth();

  export { db, auth, app }; // Export db and auth instances for use in your components
