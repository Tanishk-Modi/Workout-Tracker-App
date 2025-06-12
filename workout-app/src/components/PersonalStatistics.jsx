import React, { useState, useEffect } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { collection, query, onSnapshot } from 'firebase/firestore';

/**
 * PersonalStatistics component displays various statistics derived from the user's workout history.
 */

function PersonalStatistics({ onBack }) {

    const { db, userId, appId } = useFirebase();

    // State for raw workout data fetched from Firestore
    const [workouts, setWorkouts] = useState([]);
    // State for loading status
    const [isLoading, setIsLoading] = useState(true);
    // State for any fetch errors
    const [fetchError, setFetchError] = useState(null);

    // State for calculated statistics
    const [stats, setStats] = useState({
        totalWorkouts: 0,
        totalExercisesLogged: 0,
        totalVolumeLifted: 0, 
        mostFrequentExercise: 'N/A',
        averageExercisesPerWorkout: 0,
    });

    // --- EFFECT: Fetch workout data from Firestore in real-time ---
    
    useEffect(() => {
        // Ensure userId and appId are available before attempting to fetch data.
        if (!userId || !appId) {
            console.log("PersonalStatistics: Waiting for userId or appId to fetch workouts...");
            if (!userId && !appId) setIsLoading(false);
            return;
        }

        setIsLoading(true); // Set loading state to true when fetching begins
        setFetchError(null);  // Clear any previous errors

        // Construct the Firestore collection reference for the current user's workouts.
        const workoutsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/workouts`);
        const q = query(workoutsCollectionRef);

        // Set up a real-time listener using onSnapshot.
        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const fetchedWorkouts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date ? doc.data().date.toDate() : null
                }));

                // Sort workouts by date in descending order (most recent first)
                fetchedWorkouts.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

                setWorkouts(fetchedWorkouts); // Update the workouts state
                setIsLoading(false);          // Set loading to false once data is fetched
                console.log("PersonalStatistics: Fetched workouts:", fetchedWorkouts);
            },
            (error) => {
                console.error("PersonalStatistics: Error fetching workout history:", error);
                setFetchError('Failed to load workout data. Please try again.');
                setIsLoading(false);
            }
        );

        // Cleanup function: unsubscribes from the Firestore listener when the component unmounts.
        return () => unsubscribe();
    }, [userId, appId, db]); // Dependencies array

    // --- EFFECT: Calculate statistics whenever workouts data changes ---

    useEffect(() => {
        if (workouts.length === 0 && !isLoading) {
            // Reset stats if no workouts or finished loading with no data
            setStats({
                totalWorkouts: 0,
                totalExercisesLogged: 0,
                totalVolumeLifted: 0,
                mostFrequentExercise: 'N/A',
                averageExercisesPerWorkout: 0,
            });
            return;
        }
        if (isLoading) {
            // Don't calculate if still loading initial data
            return;
        }

        let totalExercises = 0;
        let totalVolume = 0;
        const exerciseCounts = {}; // To count occurrences of each exercise name

        workouts.forEach(workout => {
            if (workout.exercisesPerformed && Array.isArray(workout.exercisesPerformed)) {
                totalExercises += workout.exercisesPerformed.length;

                workout.exercisesPerformed.forEach(exercise => {
                    // Sum volume, converting to a common unit if desired (for now, sum as-is)
                    // For now, it will sum whatever unit was logged.
                    if (exercise.weight && typeof exercise.weight === 'number' && exercise.sets && typeof exercise.sets === 'number') {
                         totalVolume += exercise.weight * exercise.sets; // Simple volume = weight * sets
                    }

                    // Count exercise frequency
                    const name = exercise.exerciseName || 'Unknown Exercise';
                    exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
                });
            }
        });

        let mostFrequent = 'N/A';
        let maxCount = 0;
        for (const exerciseName in exerciseCounts) {
            if (exerciseCounts[exerciseName] > maxCount) {
                maxCount = exerciseCounts[exerciseName];
                mostFrequent = exerciseName;
            }
        }

        const averageExercises = workouts.length > 0 ? (totalExercises / workouts.length) : 0;

        setStats({
            totalWorkouts: workouts.length,
            totalExercisesLogged: totalExercises,
            totalVolumeLifted: totalVolume,
            mostFrequentExercise: mostFrequent,
            averageExercisesPerWorkout: averageExercises,
        });

    }, [workouts, isLoading]); // Recalculate stats whenever workouts data changes or loading state changes

    return (
        <div className="p-6 bg-gray-800 rounded-xl text-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center">Personal Statistics</h2>

            {/* Display loading, error, or no data message */}
            {isLoading && <p className="text-gray-400 text-center">Loading statistics...</p>}
            {fetchError && <p className="text-red-500 text-center">{fetchError}</p>}

            {/* Statistics Display */}
            {!isLoading && !fetchError && (
                <div className="space-y-4">
                    {workouts.length === 0 ? (
                        <p className="text-gray-400 text-center">Log some workouts to see your stats!</p>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StatCard title="Total Workouts Logged" value={stats.totalWorkouts} />
                                <StatCard title="Total Exercises Logged" value={stats.totalExercisesLogged} />
                                <StatCard title="Total Volume Lifted" value={`${stats.totalVolumeLifted.toFixed(1)}`} unit="kg/lbs" /> {/* Display unit from stats */}
                                <StatCard title="Most Frequent Exercise" value={stats.mostFrequentExercise} />
                                <StatCard title="Avg. Exercises per Workout" value={stats.averageExercisesPerWorkout.toFixed(1)} />
                            </div>
                        </div>
                    )}
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

// Helper component for displaying individual statistics
const StatCard = ({ title, value, unit = '' }) => ( // Added unit prop with default
    <div className="bg-gray-700 p-4 rounded-lg shadow-sm text-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-red-500 mt-1">
            {value} {unit}
        </p>
    </div>
);

export default PersonalStatistics;