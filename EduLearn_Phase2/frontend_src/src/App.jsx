// src/App.jsx  (UPDATED — role-based routing)
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import HomePage          from './pages/HomePage';
import LoginRegistration from './pages/LoginRegistration';
import ForgotPassword    from './pages/ForgotPassword';
import ResetPassword     from './pages/ResetPassword';

// Student pages (existing)
import DashboardPage     from './pages/DashboardPage';
import ProfilePage       from './pages/ProfilePage';
import CoursesPage       from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CalendarPage      from './pages/CalendarPage';
import QuizPage          from './pages/QuizPage';
import SettingsPage      from './pages/SettingsPage';

// Student extra pages
import HelpPage          from './pages/HelpPage';
import PastCoursesPage   from './pages/CoursesPage';

// Admin pages (NEW)
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminUsers        from './pages/admin/AdminUsers';
import AdminCourses      from './pages/admin/AdminCourses';
import AdminExams        from './pages/admin/AdminExams';
import AdminMessages     from './pages/admin/AdminMessages';
import AdminQuizzes      from './pages/admin/AdminQuizzes';

// Instructor pages (NEW)
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourse    from './pages/instructor/InstructorCourse';
import InstructorQuizEditor from './pages/instructor/InstructorQuizEditor';

// ── Route guards ──────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Generic guard — redirect to /login if not authenticated
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin-only guard — admin sees admin panel, others see their own portal
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// Instructor-only guard
function RequireInstructor({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'instructor' && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// Smart redirect after login based on role
function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')       return <Navigate to="/admin" replace />;
  if (user.role === 'instructor')  return <Navigate to="/instructor" replace />;
  return <Navigate to="/dashboard" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────

function AppRoutes() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(p => !p);
  const themeProps  = { isDarkMode, toggleTheme };

  return (
    <Routes>
      {/* Public */}
      <Route path="/"                element={<HomePage />} />
      <Route path="/login"           element={<LoginRegistration />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* Smart redirect based on role */}
      <Route path="/portal" element={<RequireAuth><RoleRedirect /></RequireAuth>} />

      {/* ── Student routes ── */}
      <Route path="/dashboard"  element={<RequireAuth><DashboardPage     {...themeProps} /></RequireAuth>} />
      <Route path="/profile"    element={<RequireAuth><ProfilePage        {...themeProps} /></RequireAuth>} />
      <Route path="/courses"    element={<RequireAuth><CoursesPage        {...themeProps} /></RequireAuth>} />
      <Route path="/course/:id" element={<RequireAuth><CourseDetailsPage  {...themeProps} /></RequireAuth>} />
      <Route path="/calendar"   element={<RequireAuth><CalendarPage       {...themeProps} /></RequireAuth>} />
      <Route path="/quiz"       element={<RequireAuth><QuizPage           {...themeProps} /></RequireAuth>} />
      <Route path="/settings"   element={<RequireAuth><SettingsPage       {...themeProps} /></RequireAuth>} />
      <Route path="/help"       element={<RequireAuth><HelpPage           {...themeProps} /></RequireAuth>} />
      <Route path="/past-courses" element={<RequireAuth><PastCoursesPage    {...themeProps} /></RequireAuth>} />

      {/* ── Admin routes ── */}
      <Route path="/admin"               element={<RequireAdmin><AdminDashboard  {...themeProps} /></RequireAdmin>} />
      <Route path="/admin/users"         element={<RequireAdmin><AdminUsers      {...themeProps} /></RequireAdmin>} />
      <Route path="/admin/courses"       element={<RequireAdmin><AdminCourses    {...themeProps} /></RequireAdmin>} />
      <Route path="/admin/exams"         element={<RequireAdmin><AdminExams      {...themeProps} /></RequireAdmin>} />
      <Route path="/admin/messages"      element={<RequireAdmin><AdminMessages   {...themeProps} /></RequireAdmin>} />
      <Route path="/admin/quizzes"       element={<RequireAdmin><AdminQuizzes    {...themeProps} /></RequireAdmin>} />

      {/* ── Instructor routes ── */}
      <Route path="/instructor"              element={<RequireInstructor><InstructorDashboard {...themeProps} /></RequireInstructor>} />
      <Route path="/instructor/course/:id"   element={<RequireInstructor><InstructorCourse    {...themeProps} /></RequireInstructor>} />
      <Route path="/instructor/quiz/:courseId/:quizId?" element={<RequireInstructor><InstructorQuizEditor {...themeProps} /></RequireInstructor>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
