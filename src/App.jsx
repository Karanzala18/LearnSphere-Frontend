  // App.jsx
  import React from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  // Import your components
  import Landing from './pages/Landing';
  import LoginPage from './pages/Authentication/Login';
  import SignUpPage from './pages/Authentication/SignUp';
  import ForgotPassword from './pages/Authentication/ForgotPassword';
  // Dashboard components
  import StudentDashboard from './pages/Dashboard/StudentDashboard';
  import FacultyDashboard from './pages/Dashboard/FacultyDashboard';
  import AdminDashboard from './pages/Dashboard/AdminDashboard';
  // Profile components
  import StudentProfile from './pages/Profile/StudentProfile';
  import FacultyProfile from './pages/Profile/FacultyProfile';
  //Subject components
  // FIX: Corrected the typo in the import path
  import CourseDetails from './pages/Subject/CourseDetails';
  import SubjectDetailsView from './pages/Subject/SubjectDetailsView';
  import EnrolledStudentsView from './pages/Subject/EnrolledStudentsView';

  // Quiz components
  import CreateQuizPage from './pages/Quiz/CreateQuizPage';
  import QuizListPage from './pages/Quiz/QuizListPage';
  import QuizViewPage from './pages/Quiz/QuizViewPage';
  import EditQuizPage from './pages/Quiz/EditQuizPage';
  import CreateQuestionPage from './pages/Quiz/CreateQuestionPage'; 
  import StudentQuizView from './pages/Quiz/StudentQuizView';

// Faculty Assignment components
import FacultyAssignment from './pages/Assignment/FacultyAssignment';

  // Protection components
  import ProtectedRoute from './components/ProtectedRoute';
  import AuthRoute from './components/AuthRoute';
import QuizAttemptPage from './pages/Quiz/QuizAttemptPage';
import QuizResultPage from './pages/Quiz/QuizResultPage';
import QuizScorecardPage from './pages/Quiz/QuizScorecardPage';
import StudentAssignment from './pages/Assignment/StudentAssignment';



  function App() {
    return (
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            
            {/* Authentication Routes - Only accessible when not logged in */}
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthRoute>
                  <SignUpPage />
                </AuthRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <AuthRoute>
                  <ForgotPassword />
                </AuthRoute>
              } 
            />
            
            {/* Protected Dashboard Routes - Role-based access */}
            <Route path="/student/*" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="profile" element={<StudentProfile />} />
                    {/* Course details with ID parameter */}
                    <Route path="subjects/:courseId" element={<CourseDetails />} />
                    <Route path='course/:courseId/quizzes' element={<StudentQuizView />} />
                    <Route path='quiz-attempts/:attemptId' element={<QuizAttemptPage />} />
                    <Route path='quiz-attempts/:attemptId/result' element={<QuizResultPage />} />
                    <Route path='course/:courseId/assignments' element={<StudentAssignment />} />
                    
                    {/* Redirect /student to /student/dashboard */}
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              } 
            />
            
            <Route path="/faculty/*" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <Routes>
                    <Route path="dashboard" element={<FacultyDashboard />} />
                    <Route path="profile" element={<FacultyProfile />} />
                    <Route path="subjects/:subjectId" element={<SubjectDetailsView />} />
                    <Route path="subjects/:subjectId/quizzes/create" element={<CreateQuizPage />} />
                    <Route path="subjects/:subjectId/quizzes" element={<QuizListPage />} />
                    <Route path="subjects/:subjectId/quizzes/:quizId" element={<QuizViewPage />} />
                    <Route path="subjects/:subjectId/quizzes/:quizId/edit" element={<EditQuizPage />} />
                    <Route path="subjects/:subjectId/quizzes/:quizId/questions/create" element={<CreateQuestionPage />} />
                    <Route path="subjects/:subjectId/students" element={<EnrolledStudentsView />} />
                    <Route path="subjects/:subjectId/assignments" element={<FacultyAssignment />} />
                    <Route path='quizzes/:quizId/scorecard' element={<QuizScorecardPage />} />
                    {/* Redirect /faculty to /faculty/dashboard */}
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                    {/* Add other faculty routes */}
                  </Routes>
                </ProtectedRoute>
              } 
            />
            <Route path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    {/* Redirect /admin to /admin/dashboard */}
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                    {/* Add other admin routes */}
                  </Routes>
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect any unknown routes to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    );
  }

  export default App;