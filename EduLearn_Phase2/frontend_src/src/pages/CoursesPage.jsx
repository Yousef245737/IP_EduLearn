// src/pages/CoursesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BookOpen, Calendar, User, Award, Clock, Search, Eye, Plus, CheckCircle, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { coursesApi, usersApi } from '../hooks/useApi';
 
export default function CoursesPage({ isDarkMode, toggleTheme }) {
  const navigate = useNavigate();
  const [courses,            setCourses]       = useState([]);
  const [enrolledIds,        setEnrolledIds]   = useState(new Set());
  const [enrollmentMap,      setEnrollmentMap] = useState({});
  const [loading,            setLoading]       = useState(true);
  const [enrolling,          setEnrolling]     = useState({});
  const [searchQuery,        setSearchQuery]   = useState('');
  const [selectedSemester,   setSemester]      = useState('all');
  const [selectedYear,       setYear]          = useState('all');
  const [selectedDepartment, setDepartment]    = useState('all');
  const [toast,              setToast]         = useState(null);
 
  useEffect(() => {
    Promise.all([coursesApi.getAll(), usersApi.getMyEnrollments()])
      .then(([allCourses, myEnrollments]) => {
        setCourses(allCourses);
        const ids = new Set();
        const map = {};
        myEnrollments.forEach(e => {
          const cid = e.course?._id || e.course;
          ids.add(cid);
          map[cid] = e;
        });
        setEnrolledIds(ids);
        setEnrollmentMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
 
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
 
  const handleEnroll = async (courseId) => {
    setEnrolling(p => ({ ...p, [courseId]: true }));
    try {
      const enrollment = await coursesApi.enroll(courseId);
      setEnrolledIds(prev => new Set([...prev, courseId]));
      setEnrollmentMap(prev => ({ ...prev, [courseId]: enrollment }));
      showToast('Successfully enrolled!');
    } catch (err) {
      showToast(err.message || 'Enrollment failed', 'error');
    } finally {
      setEnrolling(p => ({ ...p, [courseId]: false }));
    }
  };
 
  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Drop this course? Your progress will be lost.')) return;
    setEnrolling(p => ({ ...p, [courseId]: true }));
    try {
      await coursesApi.unenroll(courseId);
      setEnrolledIds(prev => { const s = new Set(prev); s.delete(courseId); return s; });
      setEnrollmentMap(prev => { const m = { ...prev }; delete m[courseId]; return m; });
      showToast('Successfully unenrolled.');
    } catch (err) {
      showToast(err.message || 'Failed to unenroll', 'error');
    } finally {
      setEnrolling(p => ({ ...p, [courseId]: false }));
    }
  };
 
  const filtered = courses.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)) &&
      (selectedSemester   === 'all' || c.semester   === selectedSemester) &&
      (selectedYear       === 'all' || c.year       === selectedYear) &&
      (selectedDepartment === 'all' || c.department === selectedDepartment)
    );
  });
 
  const semesters   = ['all', ...new Set(courses.map(c => c.semester))];
  const years       = ['all', ...new Set(courses.map(c => c.year))];
  const departments = ['all', ...new Set(courses.map(c => c.department))];
 
  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
 
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Browse and enroll in available courses</p>
        </header>
 
        <div className="p-6 space-y-6">
 
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Courses', value: courses.length,      icon: BookOpen,    color: 'text-blue-500'  },
              { label: 'Enrolled',      value: enrolledIds.size,    icon: CheckCircle, color: 'text-green-500' },
              { label: 'Departments',   value: new Set(courses.map(c => c.department)).size, icon: Award, color: 'text-yellow-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                    </div>
                    <Icon className={`w-10 h-10 ${color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
 
          {/* Filters */}
          <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Filter Courses</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">Search and filter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-gray-900 dark:border-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                {[
                  { val: selectedSemester,   set: setSemester,   opts: semesters,   label: 'All Semesters'   },
                  { val: selectedYear,       set: setYear,       opts: years,       label: 'All Years'       },
                  { val: selectedDepartment, set: setDepartment, opts: departments, label: 'All Departments' },
                ].map(({ val, set, opts, label }) => (
                  <Select key={label} value={val} onValueChange={set}>
                    <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                      <SelectValue placeholder={label} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 z-[9999]">
                      {opts.map(o => (
                        <SelectItem key={o} value={o} className="text-gray-900 dark:text-white cursor-pointer">
                          {o === 'all' ? label : o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
              </div>
            </CardContent>
          </Card>
 
          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </CardHeader>
                  <CardContent><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-12 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
              <CardContent>
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(course => {
                const isEnrolled = enrolledIds.has(course._id);
                const isBusy     = !!enrolling[course._id];
                const myEnroll   = enrollmentMap[course._id];
                const progress   = myEnroll?.progress ?? 0;
 
                return (
                  <Card key={course._id}
                    className={`bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300 flex flex-col ${isEnrolled ? 'border-l-4 border-l-green-500' : ''}`}>
 
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-1 text-gray-900 dark:text-white leading-snug">{course.title}</CardTitle>
                          <CardDescription className="font-mono font-semibold text-sm text-gray-500 dark:text-gray-400">{course.code}</CardDescription>
                        </div>
                        {isEnrolled && (
                          <span className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Enrolled
                          </span>
                        )}
                      </div>
                    </CardHeader>
 
                    <CardContent className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <User className="w-4 h-4 flex-shrink-0" /><span className="truncate">{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" /><span>{course.semester} {course.year}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{course.totalLectures} lectures{course.duration ? ` · ${course.duration}` : ''}</span>
                      </div>
                      <div className="pt-1">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{course.department}</Badge>
                      </div>
                      {isEnrolled && myEnroll && (
                        <div className="pt-1">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span><span>{progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}
                    </CardContent>
 
                    <CardFooter className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm"
                        className="flex-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={() => navigate(`/course/${course._id}`)}>
                        <Eye className="w-4 h-4 mr-1.5" /> View
                      </Button>
                      {isEnrolled ? (
                        <Button variant="outline" size="sm" disabled={isBusy}
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                          onClick={() => handleUnenroll(course._id)}>
                          {isBusy && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                          Drop
                        </Button>
                      ) : (
                        <Button size="sm" disabled={isBusy}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                          onClick={() => handleEnroll(course._id)}>
                          {isBusy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
                          Enroll
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
 
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
          ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}