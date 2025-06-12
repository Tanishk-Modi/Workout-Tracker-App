import React, { useState } from 'react';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';

import AddExercise from './components/AddExercise';
import LogWorkout from './components/LogWorkout';
import WorkoutHistory from './components/WorkoutHistory';
import ExerciseList from './components/ExerciseList';

// Page states for routing
const PAGES = {
    HOME: 'home',
    ADD_EXERCISE: 'addExercise',
    LOG_WORKOUT: 'logWorkout',
    WORKOUT_HISTORY: 'workoutHistory',
    EXERCISE_LIST: 'exerciseList',
};

function AppContent() {

    const { userId } = useFirebase();
    // State to manage current page view
    const [currentPage, setCurrentPage] = useState(PAGES.HOME); 

    // Render current page component based on `currentPage` state
    const renderPage = () => {

        if (!userId) {
            return (
                <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-300">
                    Authenticating user...
                </div>
            );
        }

        // Routing using switch/case
        switch (currentPage) {

            case PAGES.HOME:
                return (
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-gray-100 mb-6">Welcome to Your Workout Tracker! 🏋</h2>
                        <p className="text-gray-300 mb-8">
                            Start by adding some exercises, then log your workouts.
                        </p>
                        <div className="flex flex-col space-y-4 max-w-sm mx-auto">
                            <button
                                className="bg-gray-900 hover:bg-indigo-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.ADD_EXERCISE)}
                            >
                                Add New Exercise
                            </button>
                            <button
                                className="bg-gray-900 hover:bg-indigo-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.LOG_WORKOUT)}
                            >
                                Log New Workout
                            </button>
                            <button
                                className="bg-gray-900 hover:bg-indigo-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.WORKOUT_HISTORY)}
                            >
                                View Workout History
                            </button>
                            <button
                                className="bg-gray-900 hover:bg-indigo-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.
                                EXERCISE_LIST)}
                            >
                                View All Exercises
                            </button>
                        </div>
                        {/* Display User ID for multi-user context */}
                        <div className="mt-8 text-sm text-gray-400">
                            Your User ID: <span className="font-mono text-gray-200">{userId}</span>
                        </div>
                    </div>
                );

            case PAGES.ADD_EXERCISE:
                return <AddExercise onBack={() => setCurrentPage(PAGES.HOME)} />;
            case PAGES.LOG_WORKOUT:
                return <LogWorkout onBack={() => setCurrentPage(PAGES.HOME)} />;
            case PAGES.WORKOUT_HISTORY:
                return <WorkoutHistory onBack={() => setCurrentPage(PAGES.HOME)} />;
            case PAGES.EXERCISE_LIST:
                return <ExerciseList onBack={() => setCurrentPage(PAGES.HOME)} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans text-inter flex flex-col items-center py-8 px-8">
            <h1 className="text-5xl p-8 font-extrabold text-red-500 mb-10 "> ⚔️ Gym Arena ⚔️</h1>
            <div className="bg-gray-800 p-8 rounded-xl max-w-2xl w-full shadow-[0px_0px_25px_10px_rgba(250,16,16,1)]">
                {renderPage()}
            </div>
        </div>
    );
}

function App() {
    return (
        <FirebaseProvider>
            <AppContent />
        </FirebaseProvider>
    );
}

export default App;