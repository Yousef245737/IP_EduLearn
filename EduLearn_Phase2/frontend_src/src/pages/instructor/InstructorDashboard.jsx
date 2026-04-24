// src/pages/instructor/InstructorDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText, ChevronRight, Loader2 } from 'lucide-react';
import InstructorSidebar from '../../components/InstructorSidebar';
import { useAuth } from '../../context/AuthContext';

export default function InstructorDashboard({ isDarkMode, toggleTheme }) {
  const { authFetch, user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/instructor')
      .then(r => r.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <InstructorSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.name}! Manage your courses and quizzes.</p>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No courses assigned</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ask an admin to assign courses to your account.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.map(course => (
                <button
                  key={course._id}
                  onClick={() => navigate(`/instructor/course/${course._id}`)}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-left hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group"
                >
                  {/* Color bar */}
                  <div className="w-full h-1.5 bg-emerald-500 rounded-full mb-4" />
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{course.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{course.code}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-emerald-600 transition-colors mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                    {course.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.totalLectures} lectures</span>
                    <span className="ml-auto bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {course.semester} {course.year}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
