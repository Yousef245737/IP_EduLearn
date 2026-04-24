// src/pages/admin/AdminCourses.jsx
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check, Loader2, ChevronDown, ChevronUp, BookOpen, FileText, Link } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const SEMESTERS = ['Spring', 'Summer', 'Fall', 'Winter'];
const DEPTS     = ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Business', 'Arts', 'Other'];
const YEARS     = ['2023', '2024', '2025', '2026'];

const EMPTY = {
  title: '', code: '', instructor: '', instructorId: '',
  semester: 'Spring', year: '2025', department: 'Computer Science',
  description: '', duration: '', totalLectures: 0, weeks: [],
};

const EMPTY_LESSON = () => ({
  lessonId: `L${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
  title: '', duration: '', status: 'locked', description: '', videoUrl: '', resources: [],
});

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function WeeksEditor({ weeks, onChange }) {
  const [openWeeks, setOpenWeeks] = useState({});
  const toggleWeek = (wi) => setOpenWeeks(o => ({ ...o, [wi]: !o[wi] }));
  const addWeek = () => { const num = weeks.length + 1; onChange([...weeks, { weekNumber: num, title: `Week ${num}`, lessons: [] }]); };
  const removeWeek = (wi) => onChange(weeks.filter((_, i) => i !== wi));
  const updateWeek = (wi, field, val) => onChange(weeks.map((w, i) => i !== wi ? w : { ...w, [field]: val }));
  const addLesson = (wi) => onChange(weeks.map((w, i) => i !== wi ? w : { ...w, lessons: [...w.lessons, EMPTY_LESSON()] }));
  const addResource = (wi, li) => onChange(weeks.map((w, i) => i !== wi ? w : { ...w, lessons: w.lessons.map((ls, j) => j !== li ? ls : { ...ls, resources: [...(ls.resources || []), { name: '', url: '' }] }) }));
  const removeResource = (wi, li, ri) => onChange(weeks.map((w, i) => i !== wi ? w : { ...w, lessons: w.lessons.map((ls, j) => j !== li ? ls : { ...ls, resources: ls.resources.filter((_, k) => k !== ri) }) }));
  const updateResource = (wi, li, ri, field, val) => onChange(weeks.map((w, i) => i !== wi ? w : { ...w, lessons: w.lessons.map((ls, j) => j !== li ? ls : { ...ls, resources: ls.resources.map((r, k) => k !== ri ? r : { ...r, [field]: val }) }) }));
  const removeLesson = (wi, li) => onChange(weeks.map((w, i) => i !== wi ? w : { ...w, lessons: w.lessons.filter((_, j) => j !== li) }));
  const updateLesson = (wi, li, field, val) => onChange(weeks.map((w, i) => i !== wi ? w : { ...w, lessons: w.lessons.map((ls, j) => j !== li ? ls : { ...ls, [field]: val }) }));

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Weeks & Lessons</span>
        <button type="button" onClick={addWeek} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
          <Plus className="w-3 h-3" /> Add Week
        </button>
      </div>
      {weeks.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No weeks yet — click Add Week</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {weeks.map((week, wi) => (
            <div key={wi}>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800/50">
                <button type="button" onClick={() => toggleWeek(wi)} className="text-gray-400 hover:text-gray-600">
                  {openWeeks[wi] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <input value={week.title} onChange={e => updateWeek(wi, 'title', e.target.value)}
                  className="flex-1 text-sm font-medium bg-transparent text-gray-900 dark:text-white focus:outline-none focus:underline min-w-0" placeholder="Week title" />
                <span className="text-xs text-gray-400">{week.lessons.length} lesson{week.lessons.length !== 1 ? 's' : ''}</span>
                <button type="button" onClick={() => addLesson(wi)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> Lesson
                </button>
                <button type="button" onClick={() => removeWeek(wi)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {openWeeks[wi] && (
                <div className="px-4 pb-2 space-y-2">
                  {week.lessons.length === 0 ? (
                    <p className="text-xs text-gray-400 pl-6 py-1">No lessons — click + Lesson above</p>
                  ) : week.lessons.map((lesson, li) => (
                    <div key={li} className="pl-6 space-y-1.5 pb-2 border-b border-gray-100 dark:border-gray-700/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <input value={lesson.title} onChange={e => updateLesson(wi, li, 'title', e.target.value)} placeholder="Lesson title"
                          className="flex-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-0" />
                        <input value={lesson.duration} onChange={e => updateLesson(wi, li, 'duration', e.target.value)} placeholder="45 min"
                          className="w-20 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        <select value={lesson.status} onChange={e => updateLesson(wi, li, 'status', e.target.value)}
                          className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300">
                          <option value="locked">Locked</option>
                          <option value="current">Current</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button type="button" onClick={() => removeLesson(wi, li)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input value={lesson.description} onChange={e => updateLesson(wi, li, 'description', e.target.value)}
                        placeholder="Lesson description (optional)"
                        className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      <input value={lesson.videoUrl || ''} onChange={e => updateLesson(wi, li, 'videoUrl', e.target.value)}
                        placeholder="🎬 Video URL — YouTube, Vimeo, or direct .mp4 link"
                        className="w-full text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded px-2 py-1 text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      {/* Resources */}
                      <div className="space-y-1">
                        {(lesson.resources || []).map((res, ri) => (
                          <div key={ri} className="flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-orange-500 flex-shrink-0" />
                            <input value={res.name} onChange={e => updateResource(wi, li, ri, 'name', e.target.value)} placeholder="Label (e.g. Lecture Slides)"
                              className="w-28 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                            <input value={res.url} onChange={e => updateResource(wi, li, ri, 'url', e.target.value)} placeholder="PDF or doc URL"
                              className="flex-1 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400" />
                            <button type="button" onClick={() => removeResource(wi, li, ri)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addResource(wi, li)} className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline mt-0.5">
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
  );
}

export default function AdminCourses({ isDarkMode, toggleTheme }) {
  const { authFetch } = useAuth();
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    Promise.all([
      authFetch(`/admin/courses${params}`).then(r => r.json()),
      authFetch('/admin/users?role=instructor').then(r => r.json()),
    ]).then(([c, u]) => {
      setCourses(Array.isArray(c) ? c : []);
      setInstructors(Array.isArray(u) ? u : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };

  const openEdit = async (c) => {
    const res = await authFetch(`/admin/courses/${c._id}`);
    const full = await res.json();
    setForm({
      title: full.title, code: full.code, instructor: full.instructor,
      instructorId: full.instructorId || '', semester: full.semester, year: full.year,
      department: full.department || 'Computer Science', description: full.description || '',
      duration: full.duration || '', totalLectures: full.totalLectures || 0, weeks: full.weeks || [],
    });
    setError(''); setModal({ course: full });
  };

  const handleInstructorSelect = (id) => {
    const inst = instructors.find(i => i._id === id);
    setForm(p => ({ ...p, instructorId: id, instructor: inst ? inst.name : p.instructor }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.code || !form.instructor) return setError('Title, code and instructor name are required');
    setSaving(true); setError('');
    try {
      const url = modal === 'create' ? '/admin/courses' : `/admin/courses/${modal.course._id}`;
      const method = modal === 'create' ? 'POST' : 'PATCH';
      const res = await authFetch(url, { method, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed'); return; }
      setModal(null); fetchAll();
    } catch { setError('Network error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await authFetch(`/admin/courses/${deleteTarget._id}`, { method: 'DELETE' });
    setDeleteTarget(null); fetchAll();
  };

  const set = (field) => (val) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AdminSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage courses with full week & lesson content</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : courses.length === 0 ? (
              <p className="text-center py-16 text-gray-500 dark:text-gray-400">No courses found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Course</th>
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Instructor</th>
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Semester</th>
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Content</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {courses.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{c.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.code} · {c.department}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 hidden md:table-cell">{c.instructor}</td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{c.semester} {c.year}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <BookOpen className="w-3.5 h-3.5" />{c.totalLectures} lectures · {c.duration || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-xl">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modal === 'create' ? 'Add New Course' : `Edit — ${modal.course.title}`}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Course Title" required>
                  <input value={form.title} onChange={e => set('title')(e.target.value)} className={inputCls} placeholder="Advanced Database Systems" />
                </Field>
                <Field label="Course Code" required>
                  <input value={form.code} onChange={e => set('code')(e.target.value)} className={inputCls} placeholder="CS401" />
                </Field>
              </div>
              <Field label="Assign Instructor" required>
                {instructors.length > 0 && (
                  <select value={form.instructorId} onChange={e => handleInstructorSelect(e.target.value)} className={`${inputCls} mb-2`}>
                    <option value="">Select an instructor…</option>
                    {instructors.map(i => <option key={i._id} value={i._id}>{i.name} ({i.email})</option>)}
                  </select>
                )}
                <input value={form.instructor} onChange={e => setForm(p => ({ ...p, instructor: e.target.value, instructorId: '' }))}
                  placeholder={instructors.length > 0 ? 'Or type name manually' : 'Instructor name'} className={inputCls} />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Semester">
                  <select value={form.semester} onChange={e => set('semester')(e.target.value)} className={inputCls}>
                    {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Year">
                  <select value={form.year} onChange={e => set('year')(e.target.value)} className={inputCls}>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="Department">
                  <select value={form.department} onChange={e => set('department')(e.target.value)} className={inputCls}>
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Duration">
                  <input value={form.duration} onChange={e => set('duration')(e.target.value)} className={inputCls} placeholder="15 Weeks" />
                </Field>
                <Field label="Total Lectures">
                  <input type="number" value={form.totalLectures} onChange={e => set('totalLectures')(+e.target.value)} className={inputCls} min={0} />
                </Field>
              </div>
              <Field label="Description">
                <textarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3}
                  placeholder="A deep dive into advanced database concepts including query optimization, transaction management..."
                  className={`${inputCls} resize-none`} />
              </Field>
              <WeeksEditor weeks={form.weeks} onChange={set('weeks')} />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {modal === 'create' ? 'Create Course' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Course</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Delete <strong>{deleteTarget.title}</strong>? All enrollments and quizzes will also be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
