// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../hooks/useApi';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage({ isDarkMode, toggleTheme }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getMyEnrollments()
      .then(setEnrollments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total     = enrollments.length;
  const completed = enrollments.filter(e => e.status === 'Completed').length;
  const inProgress = enrollments.filter(e => e.status === 'In Progress').length;
  const avgProgress = total > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / total)
    : 0;

  const stats = [
    { label: 'Courses Enrolled',  value: total,       color: 'bg-blue-500',   icon: BookOpen      },
    { label: 'Completed',         value: completed,   color: 'bg-green-500',  icon: CheckCircle   },
    { label: 'In Progress',       value: inProgress,  color: 'bg-yellow-500', icon: Clock         },
    { label: 'Average Progress',  value: `${avgProgress}%`, color: 'bg-purple-500', icon: TrendingUp },
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {user?.name || 'Student'}! Here's your course overview.
          </p>
        </header>

        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
                <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* My Courses */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Courses</h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Browse available courses to get started.</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrollments.map((e) => (
                  <div
                    key={e._id}
                    onClick={() => navigate(`/course/${e.course?._id}`)}
                    className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{e.course?.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{e.course?.instructor}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{e.course?.semester} {e.course?.year}</p>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{e.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${e.progress}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        e.status === 'Completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>{e.status}</span>
                      {e.grade && <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Grade: {e.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
