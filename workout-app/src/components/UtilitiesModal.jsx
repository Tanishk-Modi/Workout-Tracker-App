// src/components/UtilitiesModal.jsx
import React from 'react';

function UtilitiesModal({ onClose, onNavigate }) {

    const PAGES = {
        ADD_EXERCISE: 'addExercise',
        EXERCISE_LIST: 'exerciseList',
        PERSONAL_STATS: 'personalStats',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full relative border border-gray-700">
                <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">Utilities</h3>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 text-2xl font-bold"
                    title="Close"
                >&times;</button>

                <div className="flex flex-col space-y-3">
                    <button
                        onClick={() => onNavigate(PAGES.EXERCISE_LIST)}
                        className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        View Custom Exercises
                    </button>
                    <button
                        onClick={() => onNavigate(PAGES.PERSONAL_STATS)}
                        className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        Personal Statistics
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UtilitiesModal;