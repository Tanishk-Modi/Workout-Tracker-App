import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * LogWorkout component allows users to record their workout sessions.
 * It fetches available exercises and allows logging sets, reps, and notes for each.
 * @param {object} props - Component props.
 * @param {function} props.onBack - Function to call when the user wants to go back to the home page.
 */

function LogWorkout({ onBack }) {

    const { db, userId, appId } = useFirebase(); 

    // State for the workout date (defaults to today)
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);

    const [availableExercises, setAvailableExercises] = useState([]);
    const [isLoadingExercises, setIsLoadingExercises] = useState(true);
    const [exercisesFetchError, setExercisesFetchError] = useState('');

    // State for exercises currently added to the workout being logged
    // Each item: { exerciseName: string, sets: number, reps: number, notes: string, weight: number }
    const [workoutExercises, setWorkoutExercises] = useState([]);

    // State for general messages (success/error for saving workout)
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); 
    const [isSavingWorkout, setIsSavingWorkout] = useState(false); 

    // State to control the visibility of the exercise selection modal
    const [showExerciseSelectionModal, setShowExerciseSelectionModal] = useState(false);

    // --- EFFECT: Fetch available custom exercises from Firestore ---

    useEffect(() => {
        if (!userId || !appId) {
            console.log("LogWorkout: Waiting for userId or appId...");
            return;
        }

        setIsLoadingExercises(true);
        setExercisesFetchError('');

        // Reference to the user's custom exercises collection
        const exercisesRef = collection(db, `artifacts/${appId}/users/${userId}/exercises`);
        const q = query(exercisesRef);

        // Real-time listener using onSnapshot
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const exercisesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableExercises(exercisesData);
                setIsLoadingExercises(false);
                console.log("LogWorkout: Fetched exercises:", exercisesData);
            },
            (error) => {
                console.error("Error fetching exercises:", error);
                setExercisesFetchError('Failed to load exercises. Please try again.');
                setIsLoadingExercises(false);
            }
        );

        return () => unsubscribe();
    }, [userId, appId, db]);

    // --- HANDLERS for managing exercises within the current workout ---

    /**
     * Adds a selected exercise from the available list to the current workout session.
     * Prevents adding the same exercise multiple times to the current workout.
     * @param {object} exercise - The exercise object to add (e.g., {id: '...', name: '...'}).
     */

    const handleAddExerciseToWorkout = (exercise) => {
        if (workoutExercises.some(item => item.exerciseName === exercise.name)) {
            setMessage(`'${exercise.name}' is already added to this workout.`);
            setMessageType('error');
            setTimeout(() => { setMessage(''); setMessageType(''); }, 3000);
            return;
        }

        // Add the new exercise with default values for sets, reps, notes, and weight

        setWorkoutExercises(prev => [
            ...prev,
            {
                exerciseName: exercise.name,
                sets: 1, 
                reps: 1, 
                weight: '', 
                notes: ''
            }
        ]);
        setMessage('');
        setMessageType('');
        setShowExerciseSelectionModal(false);
    };

    /**
     * Updates the sets, reps, weight, or notes for a specific exercise in the current workout session.
     * @param {number} index - The index of the exercise in the workoutExercises array.
     * @param {string} field - The field to update ('sets', 'reps', 'weight', 'notes').
     * @param {string|number} value - The new value for the field.
     */
    
    const handleUpdateExerciseDetails = (index, field, value) => {
        setWorkoutExercises(prev =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]:
                            // For sets, reps, and weight, allow empty string, otherwise parse to number
                            (field === 'sets' || field === 'reps' || field === 'weight')
                                ? (value === '' ? '' : Math.max(0, parseFloat(value) || 0))
                                : value
                    }
                    : item
            )
        );
    };

    /**
     * Removes an exercise from the current workout session.
     * @param {number} index - The index of the exercise to remove.
     */
    const handleRemoveExerciseFromWorkout = (index) => {
        setWorkoutExercises(prev => prev.filter((_, i) => i !== index));
    };

    // --- HANDLER: Save the entire workout to Firestore ---
    /**
     * Handles the submission of the entire workout session.
     * Saves the workout date and all logged exercises to Firestore.
     * @param {Event} e - The form submission event.
     */
    const handleSaveWorkout = async (e) => {
        e.preventDefault();

        if (!userId || !appId) {
            setMessage('User not authenticated or app ID not available. Cannot save workout.');
            setMessageType('error');
            return;
        }
        if (workoutExercises.length === 0) {
            setMessage('Please add at least one exercise to your workout.');
            setMessageType('error');
            return;
        }

        setIsSavingWorkout(true);
        setMessage('');
        setMessageType('');

        try {
            // Reference to the 'workouts' collection for the current user, using the appId from context
            const workoutsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/workouts`);

            // Prepare the workout data
            const workoutData = {
                userId: userId,
                date: new Date(workoutDate + 'T12:00:00'),
                exercisesPerformed: workoutExercises.map(ex => ({
                    exerciseName: ex.exerciseName,
                    sets: ex.sets === '' ? 0 : parseFloat(ex.sets),
                    reps: ex.reps === '' ? 0 : parseFloat(ex.reps),
                    weight: ex.weight === '' ? 0 : parseFloat(ex.weight),
                    notes: ex.notes,
                })),
                createdAt: serverTimestamp(),
            };

            await addDoc(workoutsCollectionRef, workoutData);

            setMessage('Workout logged successfully!');
            setMessageType('success');
            // Reset form for next workout
            setWorkoutDate(new Date().toISOString().split('T')[0]);
            setWorkoutExercises([]);
        } catch (error) {
            console.error("Error saving workout:", error);
            setMessage('Failed to log workout. Please try again.');
            setMessageType('error');
        } finally {
            setIsSavingWorkout(false);
        }
    };

    // --- RENDER FUNCTION ---
    return (
        <div className="p-6 bg-gray-800 rounded-xl text-gray-100">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">Log New Workout</h2>

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

            <form onSubmit={handleSaveWorkout} className="space-y-6">
                {/* Workout Date Input */}
                <div>
                    <label htmlFor="workoutDate" className="block text-gray-300 text-sm font-semibold mb-2">
                        Workout Date:
                    </label>
                    <input
                        type="date"
                        id="workoutDate"
                        className="shadow-sm appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent date-picker-icon-white" // Added custom class
                        value={workoutDate}
                        onChange={(e) => setWorkoutDate(e.target.value)}
                        required
                    />
                </div>

                {/* Section to add exercises to the current workout */}
                <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Exercises in this Workout</h3>

                    {/* Display loading/error for available exercises */}
                    {isLoadingExercises && <p className="text-gray-400">Loading available exercises...</p>}
                    {exercisesFetchError && <p className="text-red-500">{exercisesFetchError}</p>}
                    {!isLoadingExercises && availableExercises.length === 0 && !exercisesFetchError && (
                        <p className="text-gray-400 mb-4">No custom exercises added yet. Go to "Add New Exercise" first!</p>
                    )}

                    {/* List of exercises added to the current workout */}
                    {workoutExercises.length === 0 && !isLoadingExercises && !exercisesFetchError && availableExercises.length > 0 && (
                        <p className="text-gray-400 mb-4">Click "Add Exercise" to start logging exercises.</p>
                    )}
                    {workoutExercises.map((exercise, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded-lg mb-4 shadow-sm relative">
                            <h4 className="text-md font-bold text-gray-100 mb-3">{exercise.exerciseName}</h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveExerciseFromWorkout(index)}
                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-sm font-semibold"
                                title="Remove exercise from workout"
                            >
                                &times; Remove
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor={`sets-${index}`} className="block text-gray-300 text-sm font-semibold mb-1">Sets:</label>
                                    <input
                                        type="number"
                                        id={`sets-${index}`}
                                        className="shadow-sm appearance-none border border-gray-600 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={exercise.sets}
                                        onChange={(e) => handleUpdateExerciseDetails(index, 'sets', e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`reps-${index}`} className="block text-gray-300 text-sm font-semibold mb-1">Reps:</label>
                                    <input
                                        type="number"
                                        id={`reps-${index}`}
                                        className="shadow-sm appearance-none border border-gray-600 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={exercise.reps}
                                        onChange={(e) => handleUpdateExerciseDetails(index, 'reps', e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`weight-${index}`} className="block text-gray-300 text-sm font-semibold mb-1">Weight (kg/lbs):</label>
                                    <input
                                        type="number"
                                        id={`weight-${index}`}
                                        className="shadow-sm appearance-none border border-gray-600 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={exercise.weight}
                                        onChange={(e) => handleUpdateExerciseDetails(index, 'weight', e.target.value)}
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor={`notes-${index}`} className="block text-gray-300 text-sm font-semibold mb-1">Notes (Optional):</label>
                                <textarea
                                    id={`notes-${index}`}
                                    className="shadow-sm appearance-none border border-gray-600 rounded-lg w-full py-2 px-3 bg-gray-800 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                    value={exercise.notes}
                                    onChange={(e) => handleUpdateExerciseDetails(index, 'notes', e.target.value)}
                                    placeholder="e.g., Felt easy, increase weight next time."
                                ></textarea>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => setShowExerciseSelectionModal(true)}
                        disabled={isLoadingExercises || availableExercises.length === 0}
                        className="mt-4 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Exercise to Workout
                    </button>
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
                        disabled={isSavingWorkout || workoutExercises.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSavingWorkout ? 'Saving Workout...' : 'Complete & Log Workout'}
                    </button>
                </div>
            </form>

            {/* Exercise Selection Modal */}
            {showExerciseSelectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Select Exercises</h3>
                        <button
                            onClick={() => setShowExerciseSelectionModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 text-2xl font-bold"
                            title="Close"
                        >&times;</button>
                        {availableExercises.length === 0 ? (
                            <p className="text-gray-400">No exercises found. Please add custom exercises first.</p>
                        ) : (
                            <ul className="space-y-3">
                                {availableExercises.map((exercise) => (
                                    <li key={exercise.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg shadow-sm">
                                        <span className="text-gray-100 font-medium">{exercise.name}</span>
                                        <button
                                            onClick={() => handleAddExerciseToWorkout(exercise)}
                                            className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-3 rounded-md text-sm transition duration-200"
                                            disabled={workoutExercises.some(item => item.exerciseName === exercise.name)}
                                        >
                                            {workoutExercises.some(item => item.exerciseName === exercise.name) ? 'Added' : 'Add'}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-6 text-right">
                             <button
                                onClick={() => setShowExerciseSelectionModal(false)}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LogWorkout;
