// src/pages/admin/AdminQuizzes.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2, FileText, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const EMPTY_QUIZ = { title: '', description: '', timeLimit: 30, isGlobal: true, courseId: '' };
const EMPTY_Q    = () => ({ questionId: Date.now(), type: 'multiple-choice', question: '', options: ['', '', '', ''], correctAnswer: '' });

const inputCls = "w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";

function QuestionEditor({ q, qi, onChange, onRemove, total }) {
  const [open, setOpen] = useState(true);

  const set = (field, val) => onChange({ ...q, [field]: val });
  const setOption = (oi, val) => {
    const opts = [...q.options];
    opts[oi] = val;
    onChange({ ...q, options: opts });
  };
  const addOption    = () => onChange({ ...q, options: [...q.options, ''] });
  const removeOption = (oi) => onChange({ ...q, options: q.options.filter((_, i) => i !== oi), correctAnswer: q.correctAnswer === q.options[oi] ? '' : q.correctAnswer });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
        <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Question {qi + 1}</span>
        <select value={q.type} onChange={e => set('type', e.target.value)}
          className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300">
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True / False</option>
          <option value="short-answer">Short Answer</option>
        </select>
        <button onClick={onRemove} disabled={total === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <textarea value={q.question} onChange={e => set('question', e.target.value)} rows={2}
            placeholder="Enter your question…"
            className={`${inputCls} resize-none`} />

          {q.type === 'multiple-choice' && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Options — type correct answer in the Correct Answer field below</p>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input value={opt} onChange={e => setOption(oi, e.target.value)} placeholder={`Option ${oi + 1}`}
                    className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 placeholder-gray-400 dark:placeholder-gray-500" />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(oi)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button onClick={addOption} className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Option
                </button>
              )}
            </div>
          )}

          {q.type === 'true-false' && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Options are True / False — enter the correct answer below.</p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correct Answer <span className="text-red-500">*</span>
            </label>
            {q.type === 'true-false' ? (
              <select value={q.correctAnswer} onChange={e => set('correctAnswer', e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            ) : (
              <input value={q.correctAnswer} onChange={e => set('correctAnswer', e.target.value)}
                placeholder={q.type === 'multiple-choice' ? 'Must match one of the options exactly' : 'Expected answer'}
                className={inputCls} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQuizzes({ isDarkMode, toggleTheme }) {
  const { authFetch } = useAuth();
  const [quizzes,  setQuizzes]  = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // null | 'create' | { quiz }
  const [form,     setForm]     = useState(EMPTY_QUIZ);
  const [questions, setQuestions] = useState([EMPTY_Q()]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [delTarget, setDelTarget] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      // Fetch ALL quizzes (global + course-linked) — admin sees everything
      authFetch('/admin/quizzes').then(r => r.json()),
      authFetch('/admin/courses').then(r => r.json()),
    ]).then(([q, c]) => {
      setQuizzes(Array.isArray(q) ? q : []);
      setCourses(Array.isArray(c) ? c : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setForm(EMPTY_QUIZ);
    setQuestions([EMPTY_Q()]);
    setError('');
    setModal('create');
  };

  const openEdit = async (quiz) => {
    // Fetch full quiz with correct answers
    const res  = await authFetch(`/admin/quizzes/${quiz._id}`);
    const full = await res.json();
    setForm({
      title:       full.title,
      description: full.description || '',
      timeLimit:   full.timeLimit   || 30,
      isGlobal:    full.isGlobal    ?? true,
      courseId:    full.course?._id || full.course || '',
    });
    setQuestions(full.questions?.length ? full.questions.map(q => ({
      ...q,
      options: q.options?.length ? q.options : ['', '', '', ''],
    })) : [EMPTY_Q()]);
    setError('');
    setModal({ quiz: full });
  };

  const handleSave = async () => {
    if (!form.title) return setError('Title is required');
    if (questions.some(q => !q.question || !q.correctAnswer))
      return setError('All questions must have text and a correct answer');
    setSaving(true); setError('');
    try {
      const body = {
        title:       form.title,
        description: form.description,
        timeLimit:   +form.timeLimit * 60, // convert minutes to seconds
        isGlobal:    form.isGlobal,
        course:      form.courseId || null,
        questions:   questions.map((q, i) => ({ ...q, questionId: i + 1 })),
      };
      const url    = modal === 'create' ? '/admin/quizzes' : `/admin/quizzes/${modal.quiz._id}`;
      const method = modal === 'create' ? 'POST' : 'PATCH';
      const res    = await authFetch(url, { method, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!res.ok) { setError(data.message || 'Failed'); return; }
      setModal(null); fetchAll();
    } catch { setError('Network error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    await authFetch(`/admin/quizzes/${delTarget._id}`, { method: 'DELETE' });
    setDelTarget(null); fetchAll();
  };

  const updateQ  = (qi, val) => setQuestions(qs => qs.map((q, i) => i === qi ? val : q));
  const removeQ  = (qi) => setQuestions(qs => qs.filter((_, i) => i !== qi));
  const addQ     = () => setQuestions(qs => [...qs, EMPTY_Q()]);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AdminSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create global quizzes or assign them to specific courses</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> New Quiz
          </button>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText className="w-12 h-12 mb-3" />
              <p className="text-sm">No quizzes yet — click New Quiz to create one</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium">Title</th>
                    <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Type</th>
                    <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Course</th>
                    <th className="text-left px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Questions</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {quizzes.map(quiz => (
                    <tr key={quiz._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{quiz.title}</p>
                        {quiz.description && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{quiz.description}</p>}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {quiz.isGlobal ? (
                          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <Globe className="w-3 h-3" /> Global
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Course</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400 text-xs">
                        {quiz.course?.title || (quiz.isGlobal ? 'All students' : '—')}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                        {quiz.questions?.length ?? 0} questions
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(quiz)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDelTarget(quiz)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
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
      </main>

      {/* ── Create / Edit Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl flex flex-col" style={{maxHeight: '90vh'}}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modal === 'create' ? 'New Quiz' : `Edit — ${modal.quiz.title}`}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

              {/* Quiz settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. General Programming Entry Quiz" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                    placeholder="Brief description shown to students before starting…" className={`${inputCls} resize-none`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (minutes)</label>
                  <input type="number" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: e.target.value }))}
                    min={0} placeholder="0 = no limit" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
                  <select value={form.isGlobal ? 'global' : 'course'}
                    onChange={e => setForm(p => ({ ...p, isGlobal: e.target.value === 'global', courseId: e.target.value === 'global' ? '' : p.courseId }))}
                    className={inputCls}>
                    <option value="global">🌐 Global — visible to all students</option>
                    <option value="course">📘 Course — only enrolled students</option>
                  </select>
                </div>
                {!form.isGlobal && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Course</label>
                    <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} className={inputCls}>
                      <option value="">Select a course…</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.title} ({c.code})</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Questions</h3>
                  <button onClick={addQ} className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>
                <div className="space-y-3">
                  {questions.map((q, qi) => (
                    <QuestionEditor key={qi} q={q} qi={qi} onChange={val => updateQ(qi, val)} onRemove={() => removeQ(qi)} total={questions.length} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
              <button onClick={() => setModal(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {modal === 'create' ? 'Create Quiz' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Quiz</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Delete <strong>{delTarget.title}</strong>? All student attempts will also be removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDelTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
