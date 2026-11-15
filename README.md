# LearnSphere Frontend

LearnSphere Frontend is the client app for the LearnSphere learning platform. It is built with React and Vite and gives students, faculty, and administrators a role-based interface for managing courses, quizzes, assignments, and academic activity.

## What this app includes

- Student dashboard and subject views
- Faculty tools for creating and managing quizzes and assignments
- Admin dashboard for overseeing platform activity
- Authentication flow with protected routes
- Course and enrollment related screens
- AI-focused learning tools such as flashcards and quiz support

## Tech stack

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

## Project structure

- src/pages - app screens for landing, auth, student, faculty, and admin flows
- src/components - reusable route guards and shared UI logic
- src/services - API and auth service modules
- public - static assets

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npm run dev
   ```

3. Open the app in your browser

   The default Vite URL is usually:

   ```bash
   http://localhost:5173
   ```

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

This repository is the frontend part of the LearnSphere project. It connects to the backend services for login, course data, assignments, quizzes, and other academic features.

If you are working on the full project, make sure the backend is running and the environment variables are configured before testing the app.
