// src/pages/instructor/InstructorCourse.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp,
  Users, FileText, Loader2, BookOpen, Link,
} from 'lucide-react';
import InstructorSidebar from '../../components/InstructorSidebar';
import { useAuth } from '../../context/AuthContext';

// ── Small helpers ─────────────────────────────────────────────────────────────

function Input({ label, value, onChange, type = 'text', className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <textarea
        value={value} onChange={e => onChange(e.target.value)} rows={rows}
        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function InstructorCourse({ isDarkMode, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [course,   setCourse]   = useState(null);
  const [quizzes,  setQuizzes]  = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [tab,      setTab]      = useState('content'); // 'content' | 'quizzes' | 'students'

  // Local editable state
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [duration,    setDuration]    = useState('');
  const [lectures,    setLectures]    = useState(0);
  const [weeks,       setWeeks]       = useState([]);
  const [openWeeks,   setOpenWeeks]   = useState({});

  useEffect(() => {
    Promise.all([
      authFetch(`/instructor/${id}`).then(r => r.json()),
      authFetch(`/instructor/${id}/quizzes`).then(r => r.json()),
      authFetch(`/instructor/${id}/students`).then(r => r.json()),
    ]).then(([c, q, s]) => {
      if (c._id) {
        setCourse(c);
        setTitle(c.title);
        setDescription(c.description || '');
        setDuration(c.duration || '');
        setLectures(c.totalLectures || 0);
        setWeeks(c.weeks || []);
      }
      setQuizzes(Array.isArray(q) ? q : []);
      setStudents(Array.isArray(s) ? s : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const res  = await authFetch(`/instructor/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, description, duration, totalLectures: +lectures, weeks }),
      });
      const data = await res.json();
      if (res.ok) { setCourse(data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // ── Week / Lesson helpers ──────────────────────────────────────────────────

  const addWeek = () => {
    const num = weeks.length + 1;
    setWeeks(w => [...w, { weekNumber: num, title: `Week ${num}`, lessons: [] }]);
  };

  const removeWeek = (wi) => setWeeks(w => w.filter((_, i) => i !== wi));

  const updateWeek = (wi, field, val) =>
    setWeeks(w => w.map((wk, i) => i === wi ? { ...wk, [field]: val } : wk));

  const addLesson = (wi) =>
    setWeeks(w => w.map((wk, i) => i !== wi ? wk : {
      ...wk,
      lessons: [...wk.lessons, {
        lessonId: `L${Date.now()}`, title: 'New Lesson', duration: '', status: 'locked', description: '', videoUrl: '', resources: [],
      }],
    }));

  const removeLesson = (wi, li) =>
    setWeeks(w => w.map((wk, i) => i !== wi ? wk : { ...wk, lessons: wk.lessons.filter((_, j) => j !== li) }));

  const addResource    = (wi, li) =>
    setWeeks(w => w.map((wk, i) => i !== wi ? wk : { ...wk, lessons: wk.lessons.map((ls, j) => j !== li ? ls : { ...ls, resources: [...(ls.resources || []), { name: '', url: '' }] }) }));
  const removeResource = (wi, li, ri) =>
    setWeeks(w => w.map((wk, i) => i !== wi ? wk : { ...wk, lessons: wk.lessons.map((ls, j) => j !== li ? ls : { ...ls, resources: ls.resources.filter((_, k) => k !== ri) }) }));
  const updateResource = (wi, li, ri, field, val) =>
    setWeeks(w => w.map((wk, i) => i !== wi ? wk : { ...wk, lessons: wk.lessons.map((ls, j) => j !== li ? ls : { ...ls, resources: ls.resources.map((r, k) => k !== ri ? r : { ...r, [field]: val }) }) }));
  const updateLesson = (wi, li, field, val) =>
    setWeeks(w => w.map((wk, i) => i !== wi ? wk : {
      ...wk,
      lessons: wk.lessons.map((ls, j) => j !== li ? ls : { ...ls, [field]: val }),
    }));

  const toggleWeek = (wi) => setOpenWeeks(o => ({ ...o, [wi]: !o[wi] }));

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <InstructorSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </main>
    </div>
  );

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <InstructorSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/instructor')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{course?.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{course?.code} · {course?.semester} {course?.year}</p>
            </div>
          </div>
          {tab === 'content' && (
            <button
              onClick={save}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                saved
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              } disabled:opacity-60`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          )}
        </header>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 flex gap-6">
          {[
            { key: 'content',  label: 'Course Content', icon: BookOpen },
            { key: 'quizzes',  label: `Quizzes (${quizzes.length})`, icon: FileText },
            { key: 'students', label: `Students (${students.length})`, icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">

          {/* ── Content tab ── */}
          {tab === 'content' && (
            <>
              {/* Basic info */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Course Info</h2>
                <Input label="Title" value={title} onChange={setTitle} />
                <Textarea label="Description" value={description} onChange={setDescription} rows={3} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Duration" value={duration} onChange={setDuration} />
                  <Input label="Total Lectures" value={lectures} onChange={setLectures} type="number" />
                </div>
              </div>

              {/* Weeks & lessons */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Weeks & Lessons</h2>
                  <button onClick={addWeek} className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                    <Plus className="w-4 h-4" /> Add Week
                  </button>
                </div>

                {weeks.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">No weeks yet — click Add Week to start.</p>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {weeks.map((week, wi) => (
                      <div key={wi}>
                        {/* Week header */}
                        <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
                          <button onClick={() => toggleWeek(wi)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            {openWeeks[wi] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <input
                            value={week.title}
                            onChange={e => updateWeek(wi, 'title', e.target.value)}
                            className="flex-1 text-sm font-medium bg-transparent text-gray-900 dark:text-white focus:outline-none focus:underline"
                          />
                          <button onClick={() => addLesson(wi)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Lesson
                          </button>
                          <button onClick={() => removeWeek(wi)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Lessons */}
                        {openWeeks[wi] && (
                          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {week.lessons.length === 0 ? (
                              <p className="text-xs text-gray-400 px-12 py-3">No lessons yet.</p>
                            ) : week.lessons.map((lesson, li) => (
                              <div key={li} className="px-12 py-3 space-y-2">
                                <div className="flex items-center gap-3">
                                  <input
                                    value={lesson.title}
                                    onChange={e => updateLesson(wi, li, 'title', e.target.value)}
                                    className="flex-1 text-sm font-medium bg-transparent text-gray-900 dark:text-white focus:outline-none border-b border-transparent focus:border-emerald-400"
                                    placeholder="Lesson title"
                                  />
                                  <input
                                    value={lesson.duration}
                                    onChange={e => updateLesson(wi, li, 'duration', e.target.value)}
                                    className="w-20 text-xs bg-transparent text-gray-500 dark:text-gray-400 focus:outline-none border-b border-transparent focus:border-emerald-400 text-right"
                                    placeholder="30 min"
                                  />
                                  <select
                                    value={lesson.status}
                                    onChange={e => updateLesson(wi, li, 'status', e.target.value)}
                                    className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
                                  >
                                    <option value="locked">Locked</option>
                                    <option value="current">Current</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                  <button onClick={() => removeLesson(wi, li)} className="text-red-400 hover:text-red-600">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <textarea
                                  value={lesson.description}
                                  onChange={e => updateLesson(wi, li, 'description', e.target.value)}
                                  rows={1}
                                  placeholder="Lesson description (optional)"
                                  className="w-full text-xs text-gray-500 dark:text-gray-400 bg-transparent focus:outline-none resize-none"
                                />
                                <input
                                  value={lesson.videoUrl || ''}
                                  onChange={e => updateLesson(wi, li, 'videoUrl', e.target.value)}
                                  placeholder="🎬 Video URL — YouTube, Vimeo, or direct .mp4 link"
                                  className="w-full text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-1 text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                />
                                {/* Resources / PDFs */}
                                <div className="space-y-1.5">
                                  {(lesson.resources || []).map((res, ri) => (
                                    <div key={ri} className="flex items-center gap-1.5">
                                      <FileText className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                      <input value={res.name} onChange={e => updateResource(wi, li, ri, 'name', e.target.value)} placeholder="Label (e.g. Lecture Slides)"
                                        className="w-28 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                                      <input value={res.url} onChange={e => updateResource(wi, li, ri, 'url', e.target.value)} placeholder="PDF or doc URL"
                                        className="flex-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                                      <button type="button" onClick={() => removeResource(wi, li, ri)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => addResource(wi, li)} className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline">
                                    <Plus className="w-3 h-3" /> Add Document / PDF
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Quizzes tab ── */}
          {tab === 'quizzes' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">Quizzes</h2>
                <button
                  onClick={() => navigate(`/instructor/quiz/${id}`)}
                  className="flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> New Quiz
                </button>
              </div>
              {quizzes.length === 0 ? (
                <p className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">No quizzes yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {quizzes.map(q => (
                    <li key={q._id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{q.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{q.questions?.length ?? 0} questions · {q.timeLimit} min</p>
                      </div>
                      <button
                        onClick={() => navigate(`/instructor/quiz/${id}/${q._id}`)}
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Students tab ── */}
          {tab === 'students' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">Enrolled Students ({students.length})</h2>
              </div>
              {students.length === 0 ? (
                <p className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">No students enrolled yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {students.map(e => (
                    <li key={e._id} className="flex items-center gap-3 px-6 py-4">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                          {e.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{e.user?.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{e.progress ?? 0}%</p>
                        <p className={`text-xs ${e.status === 'Completed' ? 'text-emerald-600' : 'text-gray-400'}`}>{e.status}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
