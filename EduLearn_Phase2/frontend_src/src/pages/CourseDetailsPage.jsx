// src/pages/CourseDetailsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { coursesApi, usersApi, messagesApi } from '../hooks/useApi';

const Icon = ({ d, size = 18, stroke = 'currentColor' }) => (
  <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
);
const Icons = {
  chevron:  'M9 18l6-6-6-6',
  play:     'M5 3l14 9-14 9V3z',
  check:    'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  lock:     'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  clock:    'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM12 6v6l4 2',
  book:     'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  user:     'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  calendar: 'M3 9h18M3 4h18v16H3zM8 2v4M16 2v4',
  arrowLeft:'M19 12H5M12 5l-7 7 7 7',
  link:     'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
};

const ProgressBar = ({ value }) => (
  <div className="h-2 rounded-full bg-white/20 overflow-hidden">
    <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${value}%` }} />
  </div>
);

// ── Video embed helper ────────────────────────────────────────────────────────
// Converts any YouTube / Vimeo / direct URL into an embeddable src
function getEmbedUrl(url) {
  if (!url) return null;

  // YouTube — standard, shortened, embed, shorts
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Already an embed URL
  if (url.includes('/embed/') || url.includes('player.vimeo')) return url;

  // Direct video file — not an iframe, handled separately
  return null;
}

function isDirectVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

// ── VideoPlayer component ─────────────────────────────────────────────────────
function VideoPlayer({ url, title }) {
  if (!url) {
    // No video — show placeholder
    return (
      <div className="aspect-video bg-gray-950 rounded-xl flex flex-col items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
          <Icon d={Icons.play} size={28} stroke="#60a5fa" />
        </div>
        <p className="text-white font-semibold text-sm">No video added yet</p>
        <p className="text-gray-500 text-xs mt-1">{title}</p>
      </div>
    );
  }

  // Direct video file (mp4, webm, etc.)
  if (isDirectVideo(url)) {
    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
        <video
          src={url}
          controls
          className="w-full h-full"
          title={title}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // YouTube / Vimeo embed
  const embedUrl = getEmbedUrl(url);
  if (embedUrl) {
    return (
      <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Unknown URL format — show a clickable link fallback
  return (
    <div className="aspect-video bg-gray-950 rounded-xl flex flex-col items-center justify-center mb-6">
      <Icon d={Icons.link} size={32} stroke="#60a5fa" />
      <p className="text-white font-semibold text-sm mt-3">External Video</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-blue-400 text-xs underline hover:text-blue-300"
      >
        Open video link ↗
      </a>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
// ── Helper: merge enrollment completedLessons into course weeks ───────────────
function applyEnrollment(courseData, completedLessons) {
  if (!completedLessons || completedLessons.length === 0) return courseData;
  const completedSet = new Set(completedLessons);
  return {
    ...courseData,
    weeks: courseData.weeks.map(w => ({
      ...w,
      lessons: w.lessons.map(l => ({
        ...l,
        status: completedSet.has(l.lessonId) ? 'completed' : l.status,
      })),
    })),
  };
}

export default function CourseDetailsPage({ isDarkMode, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData,       setCourseData]       = useState(null);
  const [enrollment,       setEnrollment]       = useState(null);  // student's enrollment record
  const [loading,          setLoading]          = useState(true);
  const [currentLesson,    setCurrentLesson]    = useState(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [form,      setForm]      = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      coursesApi.getById(id),
      usersApi.getMyEnrollments(),
    ]).then(([course, enrollments]) => {
      // Find this student's enrollment for this course
      const myEnrollment = enrollments.find(
        e => (e.course?._id || e.course) === id
      ) || null;
      setEnrollment(myEnrollment);

      // Merge completed lessons into course lesson statuses
      const merged = myEnrollment
        ? applyEnrollment(course, myEnrollment.completedLessons)
        : course;

      setCourseData(merged);

      // Auto-select first non-locked lesson, or first lesson
      const allLessons = merged.weeks?.flatMap(w => w.lessons) || [];
      const firstPlayable = allLessons.find(l => l.status !== 'locked') || allLessons[0];
      if (firstPlayable) setCurrentLesson(firstPlayable);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, [id]);

  // Derived progress from enrollment (not course.completedLectures which is a static field)
  const completedCount = enrollment?.completedLessons?.length ?? 0;
  const totalLectures  = courseData?.totalLectures ?? 0;
  const progressPct    = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  const handleMarkComplete = async () => {
    if (!currentLesson || completingLesson) return;
    setCompletingLesson(true);
    try {
      const updated = await coursesApi.completeLesson(id, currentLesson.lessonId);
      // Update enrollment state so progress is live
      setEnrollment(updated);
      // Mark lesson completed in courseData
      setCourseData(prev => applyEnrollment(prev, updated.completedLessons));
      setCurrentLesson(prev => ({ ...prev, status: 'completed' }));
    } catch (err) {
      alert(err.message);
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await messagesApi.send({
        name:     form.name,
        email:    form.email,
        subject:  form.subject,
        body:     form.message,
        courseId: id,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert(err.message || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading course...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
            <button onClick={() => navigate('/courses')} className="mt-4 text-blue-600 underline">Back to Courses</button>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen flex bg-gray-50 dark:bg-gray-900`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer text-sm p-0">
              <Icon d={Icons.arrowLeft} size={14} /> Back to Courses
            </button>
            <span className="text-gray-400"><Icon d={Icons.chevron} size={14} /></span>
            <span className="text-gray-900 dark:text-white font-medium truncate">{courseData.title}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 to-gray-950 text-white px-6 py-14">
          <div className="max-w-6xl mx-auto max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white mb-4">
              {courseData.semester} {courseData.year}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight">{courseData.title}</h1>
            <div className="flex flex-wrap gap-6 text-blue-300 text-sm mb-5">
              {[
                { icon: Icons.user,  text: courseData.instructor },
                { icon: Icons.clock, text: courseData.duration || 'Self-paced' },
                { icon: Icons.book,  text: `${courseData.totalLectures} Lectures` },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon d={icon} size={15} stroke="#93c5fd" /> {text}
                </div>
              ))}
            </div>
            {courseData.description && (
              <p className="text-blue-200 leading-relaxed mb-6 text-sm">{courseData.description}</p>
            )}
            <div className="flex justify-between text-xs text-blue-300 mb-2">
              <span>Course Progress</span>
              <span>{completedCount} of {totalLectures} completed</span>
            </div>
            <ProgressBar value={progressPct} />
          </div>
        </section>

        {/* Main grid */}
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left — lesson viewer */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {currentLesson ? (
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{currentLesson.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-5">
                  <span className="flex items-center gap-1">
                    <Icon d={Icons.clock} size={13} /> {currentLesson.duration}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${currentLesson.status === 'completed' ? 'bg-green-600' : 'bg-yellow-500'}`}>
                    {currentLesson.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                {/* ── Video Player ── */}
                <VideoPlayer url={currentLesson.videoUrl} title={currentLesson.title} />

                {currentLesson.description && (
                  <div className="mb-5">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{currentLesson.description}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-800 pt-5 flex justify-end">
                  {currentLesson.status !== 'completed' ? (
                    <button
                      onClick={handleMarkComplete}
                      disabled={completingLesson}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Icon d={Icons.check} size={14} stroke="#fff" />
                      {completingLesson ? 'Marking...' : 'Mark as Complete'}
                    </button>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 text-sm font-semibold flex items-center gap-1.5">
                      <Icon d={Icons.check} size={14} stroke="currentColor" /> Completed
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">No lessons available yet.</p>
              </div>
            )}

            {/* Course info */}
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Course Information</h2>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Instructor',     value: courseData.instructor },
                  { label: 'Semester',       value: `${courseData.semester} ${courseData.year}` },
                  { label: 'Department',     value: courseData.department },
                  { label: 'Total Lectures', value: String(courseData.totalLectures) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — lesson list */}
          {courseData.weeks?.length > 0 && (
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm sticky top-4 max-h-[calc(100vh-120px)] flex flex-col overflow-hidden">
              <div className="mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white text-base">Course Lessons</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {completedCount} of {totalLectures} completed
                </p>
              </div>
              <div className="overflow-y-auto flex-1 pr-1">
                {courseData.weeks.map((week) => (
                  <div key={week.weekNumber} className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon d={Icons.calendar} size={13} />
                      <span className="font-bold text-xs text-gray-900 dark:text-white">Week {week.weekNumber}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{week.title}</p>
                    <div className="flex flex-col gap-1.5">
                      {week.lessons.map((lesson) => {
                        const active = currentLesson?.lessonId === lesson.lessonId;
                        return (
                          <button
                            key={lesson.lessonId}
                            onClick={() => lesson.status !== 'locked' && setCurrentLesson(lesson)}
                            disabled={lesson.status === 'locked'}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left w-full transition-all text-sm
                              ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'}
                              ${lesson.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="mt-0.5 flex-shrink-0">
                              {lesson.status === 'completed' && <Icon d={Icons.check} size={15} stroke="#16a34a" />}
                              {lesson.status === 'current'   && <Icon d={Icons.play}  size={15} stroke="#3b82f6" />}
                              {lesson.status === 'locked'    && <Icon d={Icons.lock}  size={15} stroke="currentColor" />}
                              {!['completed','current','locked'].includes(lesson.status) && <Icon d={Icons.play} size={15} stroke="#9ca3af" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate text-xs mb-0.5">{lesson.title}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-400 dark:text-gray-500">{lesson.duration}</p>
                                {lesson.videoUrl && (
                                  <span className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-0.5">
                                    <Icon d={Icons.play} size={10} stroke="currentColor" /> video
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact section */}
        <section className="bg-gray-100 dark:bg-gray-800 px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Get in Touch</h2>
              <p className="text-gray-500 dark:text-gray-400">Have questions about the course? We're here to help.</p>
            </div>
            <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
                {[
                  { key: 'name',    label: 'Name',    type: 'text',  placeholder: 'Your name' },
                  { key: 'email',   label: 'Email',   type: 'email', placeholder: 'your.email@example.com' },
                  { key: 'subject', label: 'Subject', type: 'text',  placeholder: 'What is this about?' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea placeholder="Your message..." value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none" />
                </div>
                <button type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
                  {submitted ? '✓ Message Sent to Admin!' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} EduLearn Student Portal. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
