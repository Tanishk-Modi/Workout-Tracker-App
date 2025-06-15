import React, { useState } from 'react';

/**
 * Assistant component will house the AI fitness assistant functionality,
 * allowing users to input preferences and generate workout plans.
 */

function Assistant({ onBack }) {

    // State variables for user's fitness preferences
    const [goal, setGoal] = useState(''); // e.g., 'build_muscle', 'lose_weight'
    const [experience, setExperience] = useState(''); // e.g., 'beginner', 'intermediate'
    const [equipment, setEquipment] = useState([]); // Array for multi-select, e.g., ['dumbbells', 'bodyweight']
    const [frequency, setFrequency] = useState(''); // e.g., '3_days', '5_days'
    const [duration, setDuration] = useState(''); 
    const [focusAreas, setFocusAreas] = useState([]); // Array for multi-select, e.g., ['full_body', 'upper_body']
    const [notes, setNotes] = useState(''); // Optional open-ended notes

    // State for UI feedback
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isGenerating, setIsGenerating] = useState(false); // To disable button during AI call
    const [workoutPlan, setWorkoutPlan] = useState(null); // To store and display the generated plan

    // Helper for handling multi-select checkboxes
    const handleCheckboxChange = (setState, value) => {
        setState(prev =>
            prev.includes(value)
                ? prev.filter(item => item !== value) // Remove if already selected
                : [...prev, value] // Add if not selected
        );
    };

    /**
     * Constructs a detailed prompt for the Gemini AI based on user selections.
     * @returns {string} The formatted prompt string.
     */

    const constructGeminiPrompt = () => {
        let prompt = "Generate a personalized workout plan based on the following criteria:\n\n";

        prompt += `Primary fitness goal: ${goal.replace(/_/g, ' ')}.\n`;
        prompt += `Current fitness level: ${experience}.\n`;
        prompt += `Equipment available: ${equipment.length > 0 ? equipment.map(e => e.replace(/_/g, ' ')).join(', ') : 'None'}.\n`;
        prompt += `Workout frequency: ${frequency.replace(/_/g, ' ')} per week.\n`;
        prompt += `Approximate duration per session: ${duration.replace(/_/g, ' ')}.\n`;

        if (focusAreas.length > 0) {
            prompt += `Specific focus areas: ${focusAreas.map(f => f.replace(/_/g, ' ')).join(', ')}.\n`;
        }

        if (notes.trim()) {
            prompt += `Additional preferences/notes: ${notes.trim()}.\n`;
        }

        prompt += `\nProvide the workout plan as a clear, plain text list. Use numbered days or clear labels for each day.
        Each exercise should be a bullet point including sets and reps.
        Do NOT include greetings, conversational filler, or disclaimers about AI limitations.
        Just output the plan itself.`;

        return prompt;
    };


    /**
     * Handles the generation of the workout plan by calling the Gemini API.
     * @param {Event} e - The form submission event.
     */
    const handleGeneratePlan = async (e) => {
        e.preventDefault();

        // Basic validation for required fields
        if (!goal || !experience || equipment.length === 0 || !frequency || !duration) {
            setMessage('Please fill in all required fields (Goal, Experience, Equipment, Frequency, Duration).');
            setMessageType('error');
            return;
        }

        setIsGenerating(true);
        setMessage('');
        setMessageType('');
        setWorkoutPlan(null); // Clear previous plan

        try {
            const prompt = constructGeminiPrompt();
            console.log("Assistant: Sending prompt to Gemini:", prompt);

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });

            const payload = { contents: chatHistory };
            const apiKey = import.meta.env.VITE_APP_GEMINI_API_KEY; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            // Check if API key is present before fetching
            if (!apiKey) {
                throw new Error("Gemini API Key is missing. Please set VITE_APP_GEMINI_API_KEY in your .env.local file.");
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                // If response is not OK (e.g., 4xx or 5xx status), throw an error
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }

            const result = await response.json();
            console.log("Assistant: Gemini API response:", result);

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const planText = result.candidates[0].content.parts[0].text;
                setWorkoutPlan(planText);
                setMessage('Workout plan generated successfully!');
                setMessageType('success');
            } else {
                setMessage('AI could not generate a plan. Please try again or adjust your preferences.');
                setMessageType('error');
                console.error("Assistant: Unexpected Gemini API response structure:", result);
            }

        } catch (error) {
            console.error("Assistant: Error generating plan:", error);
            setMessage(`Failed to generate plan: ${error.message}. Please try again.`);
            setMessageType('error');
        } finally {
            setIsGenerating(false);
            // Clear success message after a delay, error messages will persist until new attempt
            if (messageType === 'success') {
                setTimeout(() => { setMessage(''); setMessageType(''); }, 5000);
            }
        }
    };


    return (
        <div className="p-6 bg-gray-800 rounded-xl text-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-center">AI Fitness Assistant</h2>

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

            <form onSubmit={handleGeneratePlan} className="space-y-6">
                {/* 1. Primary Fitness Goal */}
                <div>
                    <label htmlFor="goal" className="block text-gray-300 text-sm font-semibold mb-2">
                        1. Primary Fitness Goal:
                    </label>
                    <select
                        id="goal"
                        className="shadow-sm border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        required
                    >
                        <option value="">Select your goal</option>
                        <option value="build_muscle">Build Muscle</option>
                        <option value="lose_weight">Lose Weight</option>
                        <option value="improve_endurance">Improve Endurance</option>
                        <option value="increase_strength">Increase Strength</option>
                        <option value="improve_flexibility">Improve Flexibility</option>
                        <option value="general_fitness">General Fitness</option>
                    </select>
                </div>

                {/* 2. Current Fitness Level */}
                <div>
                    <label htmlFor="experience" className="block text-gray-300 text-sm font-semibold mb-2">
                        2. Current Fitness Level:
                    </label>
                    <select
                        id="experience"
                        className="shadow-sm border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        required
                    >
                        <option value="">Select your level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                {/* 3. Available Equipment */}
                <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                        3. Available Equipment:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-gray-300">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="bodyweight"
                                checked={equipment.includes('bodyweight')}
                                onChange={() => handleCheckboxChange(setEquipment, 'bodyweight')}
                            />
                            <span className="ml-2 text-gray-100">Bodyweight Only</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="dumbbells"
                                checked={equipment.includes('dumbbells')}
                                onChange={() => handleCheckboxChange(setEquipment, 'dumbbells')}
                            />
                            <span className="ml-2 text-gray-100">Dumbbells</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="barbell"
                                checked={equipment.includes('barbell')}
                                onChange={() => handleCheckboxChange(setEquipment, 'barbell')}
                            />
                            <span className="ml-2 text-gray-100">Barbell</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="resistance_bands"
                                checked={equipment.includes('resistance_bands')}
                                onChange={() => handleCheckboxChange(setEquipment, 'resistance_bands')}
                            />
                            <span className="ml-2 text-gray-100">Resistance Bands</span>
                        </label>
                        <label className="inline-flex items-center col-span-2">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="gym_access"
                                checked={equipment.includes('gym_access')}
                                onChange={() => handleCheckboxChange(setEquipment, 'gym_access')}
                            />
                            <span className="ml-2 text-gray-100">Full Gym Access</span>
                        </label>
                    </div>
                </div>

                {/* 4. Workout Frequency */}
                <div>
                    <label htmlFor="frequency" className="block text-gray-300 text-sm font-semibold mb-2">
                        4. Workout Frequency (days per week):
                    </label>
                    <select
                        id="frequency"
                        className="shadow-sm border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        required
                    >
                        <option value="">Select frequency</option>
                        <option value="2_days">2 days</option>
                        <option value="3_days">3 days</option>
                        <option value="4_days">4 days</option>
                        <option value="5_days">5 days</option>
                        <option value="6_days">6 days</option>
                    </select>
                </div>

                {/* 5. Workout Duration */}
                <div>
                    <label htmlFor="duration" className="block text-gray-300 text-sm font-semibold mb-2">
                        5. Approximate Duration per Session:
                    </label>
                    <select
                        id="duration"
                        className="shadow-sm border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                    >
                        <option value="">Select duration</option>
                        <option value="30_min">30 minutes</option>
                        <option value="45_min">45 minutes</option>
                        <option value="60_min">60 minutes</option>
                        <option value="75_min">75 minutes</option>
                        <option value="90_min">90 minutes</option>
                    </select>
                </div>

                 {/* 6. Focus Areas (Optional) */}
                <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">
                        6. Specific Focus Areas (Optional):
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-gray-300">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="full_body"
                                checked={focusAreas.includes('full_body')}
                                onChange={() => handleCheckboxChange(setFocusAreas, 'full_body')}
                            />
                            <span className="ml-2 text-gray-100">Full Body</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="upper_body"
                                checked={focusAreas.includes('upper_body')}
                                onChange={() => handleCheckboxChange(setFocusAreas, 'upper_body')}
                            />
                            <span className="ml-2 text-gray-100">Upper Body</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="lower_body"
                                checked={focusAreas.includes('lower_body')}
                                onChange={() => handleCheckboxChange(setFocusAreas, 'lower_body')}
                            />
                            <span className="ml-2 text-gray-100">Lower Body</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox text-indigo-500 bg-gray-700 border-gray-600 rounded"
                                value="core"
                                checked={focusAreas.includes('core')}
                                onChange={() => handleCheckboxChange(setFocusAreas, 'core')}
                            />
                            <span className="ml-2 text-gray-100">Core</span>
                        </label>
                    </div>
                </div>

                {/* 7. Any Other Notes/Preferences */}
                <div>
                    <label htmlFor="notes" className="block text-gray-300 text-sm font-semibold mb-2">
                        7. Any Other Notes/Preferences (Optional):
                    </label>
                    <textarea
                        id="notes"
                        className="shadow-sm border border-gray-700 rounded-lg w-full py-2 px-3 bg-gray-900 text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g., Avoid knee-intensive exercises, focus on compound movements."
                    ></textarea>
                </div>

                {/* Generate Plan Button */}
                <button
                    type="submit"
                    disabled={isGenerating}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                    {isGenerating ? 'Generating Plan...' : 'Generate Workout Plan'}
                </button>
            </form>

            {/* Workout Plan Display Area */}
            {workoutPlan && (
                <div className="mt-8 pt-6 border-t border-gray-700">
                    <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">Your Personalized Workout Plan:</h3>
                    <div
                        className="whitespace-pre-wrap bg-gray-700 p-4 rounded-lg text-gray-200 text-sm overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: workoutPlan.replace(/\n/g, '<br />') }} // 
                    ></div>
                     <div className="mt-4 text-center">
                        <button
                            onClick={() => setWorkoutPlan(null)} 
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                        >
                            Generate New Plan
                        </button>
                    </div>
                </div>
            )}

            {/* Back to Home button */}
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

export default Assistant;