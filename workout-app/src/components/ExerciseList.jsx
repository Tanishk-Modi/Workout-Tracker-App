import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore'; // Import doc and deleteDoc

/**
 * ExerciseList component displays a chronological list of a user's past workouts.
 * Each workout can be expanded to show details of the exercises performed.
 * @param {object} props - Component props.
 * @param {function} props.onBack - Function to call when the user wants to go back to the home page.
 */

function ExerciseList ({ onBack }) {

    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(''); 
    const [messageType, setMessageType] = useState(''); 

    // State for delete confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [exerciseToDeleteId, setExerciseToDeleteId] = useState(null);
    const [exerciseToDeleteName, setExerciseToDeleteName] = useState('');

    const { db, userId, appId } = useFirebase();

    // --- EFFECT: Fetch exercises from Firestore in real-time ---

    useEffect(() => {

        if (!userId || !appId) {
            console.log("ExerciseList: Waiting for userId or appId to fetch exercises...");
            if (!userId && !appId) setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const exercisesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/exercises`);
        const q = query(exercisesCollectionRef);

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const fetchedExercises = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                fetchedExercises.sort((a, b) => a.name.localeCompare(b.name));

                setExercises(fetchedExercises);
                setIsLoading(false);
                console.log("ExerciseList: Fetched exercises:", fetchedExercises);
            },
            (err) => {
                console.error("Error fetching exercises:", err);
                setError('Failed to load exercises. Please try again.');
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId, appId, db]);

    // --- HANDLER: Initiate Delete Process (show confirmation modal) ---
    /**
     * Handles the click of the delete button, preparing the confirmation modal.
     * @param {string} id - The Firestore document ID of the exercise to delete.
     * @param {string} name - The name of the exercise to delete, for display in the modal.
     */

    const handleDeleteClick = (id, name) => {
        setExerciseToDeleteId(id);
        setExerciseToDeleteName(name);
        setShowConfirmModal(true);
    };

    // --- HANDLER: Confirm and Execute Delete ---
    /**
     * Executes the deletion of the exercise from Firestore after confirmation.
     */

    const confirmDelete = async () => {
        if (!exerciseToDeleteId || !userId || !appId) {
            setMessage('Cannot delete: Missing exercise ID, user ID, or app ID.');
            setMessageType('error');
            setShowConfirmModal(false);
            return;
        }

        try {
            // Construct the Firestore document reference for the specific exercise
            const exerciseDocRef = doc(db, `artifacts/${appId}/users/${userId}/exercises`, exerciseToDeleteId);
            await deleteDoc(exerciseDocRef); // Delete the document

            setMessage(`'${exerciseToDeleteName}' deleted successfully!`);
            setMessageType('success');
            setExerciseToDeleteId(null); // Clear pending delete state
            setExerciseToDeleteName('');
        } catch (err) {
            console.error("Error deleting exercise:", err);
            setMessage(`Failed to delete '${exerciseToDeleteName}'. Please try again.`);
            setMessageType('error');
        } finally {
            setShowConfirmModal(false); // Always close the modal
            // Clear message after a few seconds
            setTimeout(() => { setMessage(''); setMessageType(''); }, 4000);
        }
    };

    // --- HANDLER: Cancel Delete ---
    const cancelDelete = () => {
        setShowConfirmModal(false);
        setExerciseToDeleteId(null);
        setExerciseToDeleteName('');
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl text-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center">My Custom Exercises</h2>

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

            {/* Display loading, error, or no exercises message */}
            {isLoading && <p className="text-gray-400 text-center">Loading exercises...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!isLoading && exercises.length === 0 && !error && (
                <p className="text-gray-400 text-center">No custom exercises added yet. Use the "Add New Exercise" button from the home screen!</p>
            )}

            {/* List of Exercises */}
            {!isLoading && exercises.length > 0 && (
                <div className="space-y-3">
                    {exercises.map((exercise) => (
                        <div key={exercise.id} className="bg-gray-700 p-3 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-100">{exercise.name}</h3>
                                {exercise.description && (
                                    <p className="text-gray-300 text-sm mt-1">Description: {exercise.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteClick(exercise.id, exercise.name)}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md text-sm transition duration-300 ease-in-out transform hover:scale-105"
                                title={`Delete ${exercise.name}`}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Back to Home button */}
            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                >
                    Back to Home
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full relative border border-gray-700">
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete the exercise "<span className="font-semibold text-indigo-300">{exerciseToDeleteName}</span>"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExerciseList;