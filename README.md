# 🏋️ Gym Arena - Personal Workout Tracker 🚀

[Website Link](https://workout-tracker-app-six.vercel.app/)

This workout tracker is a React web application built with Tailwind CSS and Google Cloud Firestore, enabling users to log custom exercises and track their workout details (sets, reps, weight, notes). It provides a clean interface for viewing workout history and personal statistics, securely storing all data in a real-time database.

<img width="1414" alt="image" src="https://github.com/user-attachments/assets/c5b7dad2-9a37-48d5-83fd-93640442373b" />

## Features

* **User Authentication:** Securely manages user sessions (anonymous fallback/custom token support).
* **Custom Usernames:** Allows users to set a personalized display name.
* **Custom Exercise Management:** Add, view, and delete your own exercises.
* **Workout Logging:** Record workout sessions with:
    * Date
    * Multiple exercises per workout
    * Sets, Reps, and Weight 
    * Optional notes per exercise
* **Workout History:** View a chronological list of past workouts, expandable to see detailed exercise logs.
* **Workout Deletion:** Delete individual workout sessions from history.
* **Real-time Data:** All data is saved and synced in real-time using Firestore.
* **Responsive UI:** Built with Tailwind CSS for a clean and adaptive user experience across devices.
* **Personal Statistics:** A dedicated section for visualizing your workout data.
* **Leaderboard (Planned):** A future feature for competitive tracking.

## Tech Stack

* **Frontend:**
    * [React](https://react.dev/) 
    * [Vite](https://vitejs.dev/) 
    * [Tailwind CSS](https://tailwindcss.com/) 
* **Backend & Database:**
    * [Google Cloud Firestore](https://firebase.google.com/docs/firestore) 
    * [Firebase Authentication](https://firebase.google.com/docs/auth) 
