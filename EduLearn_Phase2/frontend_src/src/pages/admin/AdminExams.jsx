// src/pages/admin/AdminExams.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2, Calendar } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const TYPES = ['midterm', 'final', 'quiz', 'practical'];
const TYPE_COLORS = {
  midterm:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  final:     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  quiz:      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  practical: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

const EMPTY = { subject: '', type: 'midterm', date: '', time: '', location: '', duration: '', notes: '', courseId: '' };

export default function AdminExams({ isDarkMode, toggleTheme }) {
  const { authFetch } = useAuth();
  const [exams,    setExams]    = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [delTarget, setDelTarget] = useState(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      authFetch('/admin/exams').then(r => r.json()),
      authFetch('/admin/courses').then(r => r.json()),
    ]).then(([e, c]) => {
      setExams(Array.isArray(e) ? e : []);
      setCourses(Array.isArray(c) ? c : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setForm(EMPTY); setError(''); setModal('create'); };
  const openEdit   = (exam) => {
    setForm({
      subject:  exam.subject,
      type:     exam.type,
      date:     exam.date ? exam.date.substring(0, 10) : '',
      time:     exam.time,
      location: exam.location || '',
      duration: exam.duration || '',
      notes:    exam.notes    || '',
      courseId: exam.courseId?._id || exam.courseId || '',
    });
    setError(''); setModal({ exam });
  };

  const handleSubmit = async () => {
    if (!form.subject || !form.type || !form.date || !form.time)
      return setError('Subject, type, date and time are required');
    setSaving(true); setError('');
    try {
      const url    = modal === 'create' ? '/admin/exams' : `/admin/exams/${modal.exam._id}`;
      const method = modal === 'create' ? 'POST' : 'PATCH';
      const res    = await authFetch(url, { method, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) { setError(data.message || 'Failed'); return; }
      setModal(null); fetchAll();
    } catch { setError('Network error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    await authFetch(`/admin/exams/${delTarget._id}`, { method: 'DELETE' });
    setDelTarget(null); fetchAll();
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));
  const inputCls = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AdminSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Schedule</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Global exams visible to all enrolled students automatically</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Exam
          </button>
        </header>

        <div className="p-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
            ) : exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Calendar className="w-12 h-12 mb-3" />
                <p className="text-sm">No global exams yet — click Add Exam to create one</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Subject</th>
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Type</th>
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Date & Time</th>
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Course</th>
                      <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Location</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {exams.map(exam => (
                      <tr key={exam._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{exam.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[exam.type]}`}>{exam.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 dark:text-white">{new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{exam.time}{exam.duration ? ` · ${exam.duration}` : ''}</p>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-600 dark:text-gray-400 text-xs">
                          {exam.courseId?.title ? `${exam.courseId.title} (${exam.courseId.code})` : 'All enrolled'}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400">{exam.location || '—'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(exam)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDelTarget(exam)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
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

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modal === 'create' ? 'Add Global Exam' : `Edit — ${modal.exam.subject}`}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject <span className="text-red-500">*</span></label>
                <input value={form.subject} onChange={set('subject')} placeholder="e.g. Advanced Database Systems Midterm" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type <span className="text-red-500">*</span></label>
                  <select value={form.type} onChange={set('type')} className={inputCls}>
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course (optional)</label>
                  <select value={form.courseId} onChange={set('courseId')} className={inputCls}>
                    <option value="">All enrolled students</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={set('date')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time <span className="text-red-500">*</span></label>
                  <input value={form.time} onChange={set('time')} placeholder="e.g. 9:00 AM – 11:00 AM" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input value={form.location} onChange={set('location')} placeholder="e.g. Hall A, Room 201" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <input value={form.duration} onChange={set('duration')} placeholder="e.g. 2 hours" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any important instructions for students…" className={`${inputCls} resize-none`} />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {modal === 'create' ? 'Create Exam' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Exam</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Delete <strong>{delTarget.subject}</strong>? It will be removed from all students' calendars.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
