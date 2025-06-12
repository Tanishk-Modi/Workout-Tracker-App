import React, { useState } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * AddExercise component allows users to add new custom exercises to their profile.
 * @param {object} props - Component props.
 * @param {function} props.onBack - Function to call when the user wants to go back.
 */

function AddExercise({ onBack }) {

    // Destructure appId from useFirebase() hook
    const { db, userId, appId } = useFirebase(); 
    const [exerciseName, setExerciseName] = useState('');
    const [exerciseDescription, setExerciseDescription] = useState('');
    const [message, setMessage] = useState(''); // For success/error messages
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isSaving, setIsSaving] = useState(false); // Prevent multiple submissions
    
    const handleSubmit = async (e) => {

        e.preventDefault(); // Prevent default form submission behavior (page reload)

        if (!exerciseName.trim()) {
            setMessage('Exercise name cannot be empty.');
            setMessageType('error');
            return;
        }
        if (!userId) {
            setMessage('User not authenticated. Please wait.');
            setMessageType('error');
            return;
        }
        if (!appId) { 
            setMessage('App ID not available. Cannot save exercise.');
            setMessageType('error');
            return;
        }


        setIsSaving(true); 
        setMessage(''); 
        setMessageType('');

        try {
            // Reference to the 'exercises' collection for the current user
            // Path: artifacts/{appId}/users/{userId}/exercises
            const exercisesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/exercises`); 

            await addDoc(exercisesCollectionRef, {
                name: exerciseName.trim(),
                description: exerciseDescription.trim(),
                createdAt: serverTimestamp(), 
            });

            setMessage('Exercise added successfully!');
            setMessageType('success');
            setExerciseName(''); 
            setExerciseDescription('');
        } catch (error) {
            console.error("Error adding exercise: ", error);
            setMessage('Failed to add exercise. Please try again.');
            setMessageType('error');
        } finally {
            setIsSaving(false); // Re-enable button
        }
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">Add New Exercise</h2>

            {/* Message display for success or error */}
            {message && (
                <div
                    className={`p-3 mb-4 rounded-lg text-center font-medium ${
                        messageType === 'success' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
                    }`}
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="exerciseName" className="block text-gray-300 text-sm font-semibold mb-2">
                        Exercise Name:
                    </label>
                    <input
                        type="text"
                        id="exerciseName"
                        className="shadow-sm appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="e.g., Barbell Squats"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="exerciseDescription" className="block text-gray-300 text-sm font-semibold mb-2">
                        Description (Optional):
                    </label>
                    <textarea
                        id="exerciseDescription"
                        className="shadow-sm appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
                        rows="3"
                        value={exerciseDescription}
                        onChange={(e) => setExerciseDescription(e.target.value)}
                        placeholder="e.g., Compound exercise for legs and core."
                    ></textarea>
                </div>
                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                    >
                        Back to Home
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving} // Disable button while saving
                        className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Add Exercise'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddExercise;