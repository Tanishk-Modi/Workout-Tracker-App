// src/App.jsx
import React, { useState } from 'react';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';

import AddExercise from './components/AddExercise';
import LogWorkout from './components/LogWorkout';
import WorkoutHistory from './components/WorkoutHistory';
import ExerciseList from './components/ExerciseList';
import UtilitiesModal from './components/UtilitiesModal';
import PersonalStatistics from './components/PersonalStatistics';
import SetUsername from './components/SetUsername'; 
import Assistant from './components/Assistant';


// Page states for routing
const PAGES = {
    HOME: 'home',
    ADD_EXERCISE: 'addExercise',
    LOG_WORKOUT: 'logWorkout',
    WORKOUT_HISTORY: 'workoutHistory',
    EXERCISE_LIST: 'exerciseList',
    PERSONAL_STATS: 'personalStats',
    SET_USERNAME: 'setUsername', 
    ASSISTANT: 'assistant',
};

function AppContent() {
    
    const { userId, username } = useFirebase(); 
    const [currentPage, setCurrentPage] = useState(PAGES.HOME);
    const [showUtilitiesModal, setShowUtilitiesModal] = useState(false);

    // Render current page component based on `currentPage` state
    const renderPage = () => {

        // Authentication and Username Check
        if (!userId) {
            return (
                <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-300">
                    Authenticating user... 
                </div>
            );
        }

        if (userId && username === null) {
            // User is authenticated (has a userId) but does not have a username set.
            return <SetUsername />; 
        }

        // Routing using switch/case
        switch (currentPage) {

            case PAGES.HOME:
                return (
                    <div className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-red-500 mb-6">Your personal workout tracker 🏋</h2>
                        <p className="text-gray-300 mb-8">
                            Start by adding exercises, then log your workouts and track your progress.
                        </p>
                        <div className="flex flex-col space-y-4 max-w-sm mx-auto">
                            <button
                                className="bg-gray-900 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.ADD_EXERCISE)} 
                            >
                                Add New Exercise
                            </button>
                            <button
                                className="bg-gray-900 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.LOG_WORKOUT)}
                            >
                                Log New Workout
                            </button>
                            <button
                                className="bg-gray-900 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setCurrentPage(PAGES.WORKOUT_HISTORY)}
                            >
                                View Workout History
                            </button>
                            {/* Utilities Button to open the modal */}
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                onClick={() => setShowUtilitiesModal(true)}
                            >
                                Utilities
                            </button>
                        </div>
                        {/* Display Username or User ID */}
                        <div className="mt-8 text-sm text-gray-400">
                            {username ? ( // Display username if available, else userId
                                <span>Logged in as: <span className="font-mono text-gray-200">{username}</span></span>
                            ) : (
                                <span>Your User ID: <span className="font-mono text-gray-200">{userId}</span></span>
                            )}
                        </div>
                    </div>
                );

            case PAGES.ADD_EXERCISE:
                return <AddExercise onBack={() => setCurrentPage(PAGES.HOME)} />;
            case PAGES.LOG_WORKOUT:
                return <LogWorkout onBack={() => setCurrentPage(PAGES.HOME)}/>;
            case PAGES.WORKOUT_HISTORY:
                return <WorkoutHistory onBack={() => setCurrentPage(PAGES.HOME)} />;
            case PAGES.PERSONAL_STATS:
                return <PersonalStatistics onBack={() => setCurrentPage(PAGES.HOME)} />;
            case PAGES.EXERCISE_LIST:
                return <ExerciseList onBack={() => setCurrentPage(PAGES.HOME)} />;
            case PAGES.SET_USERNAME: 
                 return <SetUsername onBack={() => setCurrentPage(PAGES.HOME)} />; 
            case PAGES.ASSISTANT: 
                return <Assistant onBack={() => setCurrentPage(PAGES.HOME)} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans text-inter flex flex-col items-center py-8 px-8 relative overflow-hidden"> 
            <h1 className="text-5xl p-8 font-extrabold text-red-500 mb-10 "> ⚔️ Gym Arena ⚔️</h1>
            <div className="bg-gray-800 p-8 rounded-xl max-w-2xl w-full shadow-[0px_0px_25px_10px_rgba(250,16,16,1)]">
                {renderPage()}
                {showUtilitiesModal && (
                <UtilitiesModal
                    onClose={() => setShowUtilitiesModal(false)}
                    onNavigate={(page) => {
                        setCurrentPage(page);
                        setShowUtilitiesModal(false);
                    }}
                />
            )}
            </div>

            {currentPage === PAGES.HOME && ( 
                <div className="fixed bottom-8 right-8 z-50 flex items-end justify-end">
                    {/* Stylish Arrow and Text */}
                    <div className="relative mr-4 mb-2 p-2 rounded-lg bg-red-500 text-white shadow-lg pointer-events-none opacity-0 animate-fade-in-right-then-left">
                        <p className="text-sm font-semibold whitespace-nowrap">Click for AI Assistance</p>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full w-0 h-0 border-t-[8px] border-b-[8px] border-l-[8px] border-t-transparent border-b-transparent border-l-red-500"></div>
                    </div>

                    {/* Circular AI Assistant Button */}
                    <button
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg transform hover:scale-110 transition duration-300 ease-in-out cursor-pointer"
                        onClick={() => setCurrentPage(PAGES.ASSISTANT)}
                        title="AI Fitness Assistant"
                    >
                        🧠
                    </button>
                </div>
            )}

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