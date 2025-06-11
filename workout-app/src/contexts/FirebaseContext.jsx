// src/contexts/FirebaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, app } from '../lib/firebase'; // Import initialized Firebase instances
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged

// Create a React Context for Firebase
const FirebaseContext = createContext(null);

/**
 * Custom hook to easily access Firebase instances and user ID from the context.
 * @returns {{db: any, auth: any, userId: string | null, appId: string}} - Returns Firebase database, auth, current user ID, and app ID.
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

    // Access __app_id. Use a default if not defined (e.g., for local development)
    // The typeof check prevents ReferenceError when __app_id is truly not defined globally
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-workout-app';
    console.log("FirebaseProvider: Using app ID:", appId); // Debugging line

    useEffect(() => {
        // Listener for Firebase Authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                console.log("FirebaseProvider: User is signed in with UID:", user.uid);
            } else {
                setUserId(null);
                console.log("FirebaseProvider: User is signed out.");
            }
            setLoading(false); // Authentication state has been determined
        });

        // Cleanup function: unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array means this effect runs once on mount

    // Provide the Firebase instances, userId, and appId to all children components
    return (
        <FirebaseContext.Provider value={{ db, auth, userId, appId }}>
            {loading ? (
                <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
                    Loading authentication...
                </div>
            ) : (
                children
            )}
        </FirebaseContext.Provider>
    );
};