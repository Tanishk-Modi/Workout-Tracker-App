// src/App.jsx
import React, { useState } from 'react';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext'; // Import the provider and hook
import AddExercise from './components/AddExercise'; // We'll create this next

// Define different page states for simple routing
const PAGES = {
    HOME: 'home',
    ADD_EXERCISE: 'addExercise',
    LOG_WORKOUT: 'logWorkout',
    WORKOUT_HISTORY: 'workoutHistory',
};

// Main App component
function AppContent() {
    // Get the userId from the FirebaseContext. This will be null initially until authenticated.
    const { userId } = useFirebase();
    const [currentPage, setCurrentPage] = useState(PAGES.HOME); // State to manage current page view

    // Helper to render the current page component based on `currentPage` state
    const renderPage = () => {
        if (!userId) {
            // Display a message if userId is not yet available (should be handled by FirebaseProvider's loading state)
            // This is a safety net, as FirebaseProvider should show "Loading..."
            return (
                <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-300">
                    Authenticating user...
                </div>
            );
        }

        // Simple routing using switch/case
        switch (currentPage) {
            case PAGES.HOME:
                return (
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-gray-100 mb-6">Welcome to Your Workout Tracker!</h2>
                        <p className="text-gray-300 mb-8">
                            Start by adding some exercises, then log your workouts.
                        </p>
                        <div className="flex flex-col space-y-4 max-w-sm mx-auto">
                            <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.ADD_EXERCISE)}
                            >
                                Add New Exercise
                            </button>
                            <button
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.LOG_WORKOUT)}
                            >
                                Log New Workout
                            </button>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.WORKOUT_HISTORY)}
                            >
                                View Workout History
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
                // Placeholder for future component
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-100 mb-4">Log a New Workout</h2>
                        <p className="text-gray-300">This feature is coming soon!</p>
                        <button
                            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                            onClick={() => setCurrentPage(PAGES.HOME)}
                        >
                            Back to Home
                        </button>
                    </div>
                );
            case PAGES.WORKOUT_HISTORY:
                // Placeholder for future component
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-100 mb-4">Workout History</h2>
                        <p className="text-gray-300">This feature is coming soon!</p>
                        <button
                            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                            onClick={() => setCurrentPage(PAGES.HOME)}
                        >
                            Back to Home
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 font-sans text-inter flex flex-col items-center py-8">
            <h1 className="text-4xl font-extrabold text-indigo-400 mb-10">Workout Tracker</h1>
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-2xl w-full">
                {renderPage()}
            </div>
        </div>
    );
}

// Wrap the AppContent with FirebaseProvider to make Firebase context available
function App() {
    return (
        <FirebaseProvider>
            <AppContent />
        </FirebaseProvider>
    );
}

export default App;