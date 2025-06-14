import React, { useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, setDoc } from 'firebase/firestore'; 

/**
 * SetUsername component allows an authenticated user to set their custom username.
 */

function SetUsername() {

    const { db, userId, appId, setUsername: setContextUsername } = useFirebase();
    const [inputUsername, setInputUsername] = useState('');
    const [message, setMessage] = useState(''); // For success/error messages
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isSaving, setIsSaving] = useState(false); // State to prevent multiple submissions

    /**
     * Handles the form submission to save the user's chosen username to Firestore.
     */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedUsername = inputUsername.trim();

        if (!trimmedUsername) {
            setMessage('Username cannot be empty.');
            setMessageType('error');
            return;
        }

        if (!userId || !appId) {
            setMessage('Authentication error. Please refresh the page.');
            setMessageType('error');
            return;
        }

        setIsSaving(true);
        setMessage('');
        setMessageType('');

        try {
            // Reference to the user's profile document.
            const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'info');

            await setDoc(profileDocRef, {
                username: trimmedUsername,
            }, { merge: true });

            console.log("SetUsername: Username saved successfully:", trimmedUsername);
            setMessage('Username set successfully!');
            setMessageType('success');

            setContextUsername(trimmedUsername);

        } catch (error) {
            console.error("SetUsername: Error saving username:", error);
            setMessage('Failed to set username. Please try again.');
            setMessageType('error');
        } finally {
            setIsSaving(false);
            // Message will disappear as component unmounts upon successful username set.
            if (messageType === 'error') {
                 setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
            }
        }
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl text-gray-100 min-h-[300px] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold mb-6 text-center">Set Your Username</h2>
            <p className="text-gray-300 mb-8 text-center">
                Choose a unique username to personalize your workout tracker experience.
            </p>

            {message && (
                <div
                    className={`p-3 mb-4 rounded-lg text-center font-medium w-full ${
                        messageType === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
                    }`}
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
                <div>
                    <label htmlFor="username" className="block text-gray-300 text-sm font-semibold mb-2 text-left">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="shadow-sm appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                        value={inputUsername}
                        onChange={(e) => setInputUsername(e.target.value)}
                        placeholder=""
                        required
                        maxLength="20" 
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                    {isSaving ? 'Saving...' : 'Set Username'}
                </button>
            </form>
        </div>
    );
}

export default SetUsername;