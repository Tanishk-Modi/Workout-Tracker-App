import React from 'react';

function PersonalStatistics({ onBack }) {
    return (
        <div className="p-6 bg-gray-800 rounded-xl text-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-center">Personal Statistics</h2>
            <p className="text-gray-300 text-center">Personal statistics feature coming soon!</p>
            <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default PersonalStatistics;