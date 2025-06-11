import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, app } from '../lib/firebase'; // Import initialized Firebase instances
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

// Create a React Context for Firebase
const FirebaseContext = createContext(null);

/**
 * Custom hook to easily access Firebase instances and user ID from the context.
 * @returns {{db: any, auth: any, userId: string | null}} - Returns Firebase database, auth, and current user ID.
 */
export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

/**
 * FirebaseProvider component to provide Firebase instances and user ID to its children.
 * It manages the authentication state and ensures Firebase is ready before rendering children.
 */
export const FirebaseProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true); // State to track if auth state is resolved

    useEffect(() => {
        // Listener for Firebase Authentication state changes
        // This function will be called whenever the user's sign-in state changes (e.g., signed in, signed out).
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, get their UID (Unique Identifier)
                setUserId(user.uid);
                console.log("FirebaseProvider: User is signed in with UID:", user.uid);
            } else {
                // User is signed out or not yet signed in
                setUserId(null);
                console.log("FirebaseProvider: User is signed out.");
            }
            setLoading(false); // Authentication state has been determined
        });

        // Cleanup function: unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect runs once on mount

    // Provide the Firebase instances and userId to all children components
    // Only render children when authentication state is resolved (not loading)
    return (
        <FirebaseContext.Provider value={{ db, auth, userId }}>
            {loading ? (
                // Show a loading indicator while waiting for authentication to resolve
                <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
                    Loading authentication...
                </div>
            ) : (
                children
            )}
        </FirebaseContext.Provider>
    );
};