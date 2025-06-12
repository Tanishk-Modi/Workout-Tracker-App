import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, onSnapshot } from 'firebase/firestore';

/**
 * WorkoutHistory component displays a chronological list of a user's past workouts.
 * Each workout can be expanded to show details of the exercises performed.
 * @param {object} props - Component props.
 * @param {function} props.onBack - Function to call when the user wants to go back to the home page.
 */
function WorkoutHistory({ onBack }) {
    const { db, userId, appId } = useFirebase();

    const [workouts, setWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [expandedWorkoutId, setExpandedWorkoutId] = useState(null);

    // --- EFFECT: Fetch workout data from Firestore in real-time ---
    useEffect(() => {
        if (!userId || !appId) {
            console.log("WorkoutHistory: Waiting for userId or appId to fetch workouts...");
            if (!userId && !appId) setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setFetchError('');

        const workoutsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/workouts`);
        const q = query(workoutsCollectionRef);

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const fetchedWorkouts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date ? doc.data().date.toDate() : null
                }));

                fetchedWorkouts.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

                setWorkouts(fetchedWorkouts);
                setIsLoading(false);
                console.log("WorkoutHistory: Fetched workouts:", fetchedWorkouts);
            },
            (error) => {
                console.error("Error fetching workout history:", error);
                setFetchError('Failed to load workout history. Please try again.');
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId, appId, db]);

    /**
     * Toggles the expansion state of a workout item.
     * @param {string} workoutId - The ID of the workout to expand/collapse.
     */
    const toggleWorkoutDetails = (workoutId) => {
        setExpandedWorkoutId(prevId => (prevId === workoutId ? null : workoutId));
    };

    // Helper function to format the workout date for display
    const formatDate = (date) => {
        if (!date) return 'No Date';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl text-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center">Workout History</h2>

            {/* Display loading, error, or no workouts message */}
            {isLoading && <p className="text-gray-400 text-center">Loading workout history...</p>}
            {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}
            {!isLoading && workouts.length === 0 && !fetchError && (
                <p className="text-gray-400 text-center">No workouts logged yet. Go to "Log New Workout" to start!</p>
            )}

            {/* List of Workouts */}
            {!isLoading && workouts.length > 0 && (
                <div className="space-y-4">
                    {workouts.map((workout) => (
                        <div key={workout.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleWorkoutDetails(workout.id)}
                            >
                                <h3 className="text-lg font-semibold text-gray-100">
                                    Workout on {formatDate(workout.date)}
                                </h3>
                                <span className="text-gray-400 text-xl">
                                    {expandedWorkoutId === workout.id ? '▲' : '▼'}
                                </span>
                            </div>

                            {/* Expanded Workout Details (conditionally rendered) */}
                            {expandedWorkoutId === workout.id && (
                                <div className="mt-4 border-t border-gray-600 pt-4">
                                    <h4 className="text-md font-bold text-gray-200 mb-2">Exercises Performed:</h4>
                                    {workout.exercisesPerformed && workout.exercisesPerformed.length > 0 ? (
                                        <ul className="space-y-3">
                                            {workout.exercisesPerformed.map((exercise, idx) => (
                                                <li key={idx} className="bg-gray-800 p-3 rounded-md shadow-sm">
                                                    <p className="font-semibold text-indigo-300">{exercise.exerciseName}</p>
                                                    <p className="text-gray-300 text-sm">
                                                        Sets: {exercise.sets} | Reps: {exercise.reps}
                                                        {exercise.weight !== null && exercise.weight !== undefined && exercise.weight !== '' && ( // Check if weight exists and is not empty
                                                            <span> | Weight: {exercise.weight}</span> // Display weight
                                                        )}
                                                    </p>
                                                    {exercise.notes && (
                                                        <p className="text-gray-400 text-xs mt-1 italic">Notes: {exercise.notes}</p>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No exercises recorded for this workout.</p>
                                    )}
                                </div>
                            )}
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
        </div>
    );
}

export default WorkoutHistory;