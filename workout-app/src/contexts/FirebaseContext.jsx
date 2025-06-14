import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, app } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

const FirebaseContext = createContext(null);

/**
 * Custom hook to easily access Firebase instances, user ID, app ID, and username from the context.
 */

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};

/**
 * FirebaseProvider component to provide Firebase instances, user ID, app ID, and username to its children.
 * It manages the authentication state and ensures Firebase is ready before rendering children.
 */

export const FirebaseProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null); // New state for the user's custom username
    const [loading, setLoading] = useState(true);

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-workout-app';
    console.log("FirebaseProvider: Using app ID:", appId);

    useEffect(() => {
        // Listener for Firebase Authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => { // Made async to await Firestore fetch
            if (user) {
                setUserId(user.uid);
                console.log("FirebaseProvider: User signed in with UID:", user.uid);

                // --- Fetch user profile to get username ---
                if (db && appId) { 
                    try {
                        const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'info'); // Using 'info' as fixed doc ID
                        const profileSnap = await getDoc(profileDocRef);

                        if (profileSnap.exists()) {
                            const userData = profileSnap.data();
                            if (userData.username) {
                                setUsername(userData.username);
                                console.log("FirebaseProvider: Loaded username:", userData.username);
                            } else {
                                setUsername(null); // Explicitly null if no username field
                                console.log("FirebaseProvider: User profile exists, but no username found.");
                            }
                        } else {
                            setUsername(null); // User profile document doesn't exist yet
                            console.log("FirebaseProvider: User profile document does not exist for UID:", user.uid);
                        }
                    } catch (error) {
                        console.error("FirebaseProvider: Error fetching user profile:", error);
                        setUsername(null); // Ensure username is null on error
                    }
                }

            } else {
                setUserId(null);
                setUsername(null); // Clear username if user signs out
                console.log("FirebaseProvider: User is signed out.");
            }
            setLoading(false); // Authentication and initial profile check complete
        });

        // Cleanup function
        return () => unsubscribe();
    }, [db, appId]); 

    return (
        <FirebaseContext.Provider value={{ db, auth, userId, appId, username, setUsername }}> 
            {loading ? (
                <div className="flex justify-center items-center h-screen text-xl font-semibold text-red-600 bg-black">
                    Loading authentication...
                </div>
            ) : (
                children
            )}
        </FirebaseContext.Provider>
    );
};