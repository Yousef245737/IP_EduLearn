// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, TrendingUp, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ isDarkMode, toggleTheme }) {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/admin/stats').then(r => r.json()),
      authFetch('/admin/users?role=instructor').then(r => r.json()),
    ]).then(([s, u]) => {
      setStats(s);
      setUsers(Array.isArray(u) ? u.slice(0, 5) : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AdminSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Platform statistics and quick actions</p>
        </header>

        <div className="p-6 space-y-6">

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Users}        label="Total Users"        value={stats?.totalUsers}       color="text-blue-600"   bg="bg-blue-50 dark:bg-blue-900/20" />
              <StatCard icon={GraduationCap} label="Students"          value={stats?.studentCount}     color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
              <StatCard icon={UserCheck}    label="Instructors"        value={stats?.instructorCount}  color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
              <StatCard icon={BookOpen}     label="Total Courses"      value={stats?.totalCourses}     color="text-amber-600"  bg="bg-amber-50 dark:bg-amber-900/20" />
              <StatCard icon={TrendingUp}   label="Total Enrollments"  value={stats?.totalEnrollments} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/20" />
              <StatCard icon={ShieldCheck}  label="Admins"             value={stats ? stats.totalUsers - stats.studentCount - stats.instructorCount : null} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" />
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-left hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Manage Users</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add instructors, manage students and admins</p>
            </button>

            <button
              onClick={() => navigate('/admin/courses')}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Manage Courses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create and edit courses, assign instructors</p>
            </button>
          </div>

          {/* Recent instructors */}
          {users.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">Recent Instructors</h2>
                <button onClick={() => navigate('/admin/users')} className="text-sm text-purple-600 dark:text-purple-400 hover:underline">View all</button>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map(u => (
                  <li key={u._id} className="flex items-center gap-3 px-6 py-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">{u.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                    </div>
                    <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">instructor</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
