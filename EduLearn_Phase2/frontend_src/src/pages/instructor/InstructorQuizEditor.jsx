// src/pages/instructor/InstructorQuizEditor.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Loader2, GripVertical, Check } from 'lucide-react';
import InstructorSidebar from '../../components/InstructorSidebar';
import { useAuth } from '../../context/AuthContext';

const EMPTY_QUESTION = () => ({
  text: '',
  type: 'multiple_choice',
  options: ['', '', '', ''],
  correctAnswer: 0,
  points: 1,
});

export default function InstructorQuizEditor({ isDarkMode, toggleTheme }) {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const isEditing = !!quizId;

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit,   setTimeLimit]   = useState(30);
  const [dueDate,     setDueDate]     = useState('');
  const [questions,   setQuestions]   = useState([EMPTY_QUESTION()]);
  const [loading,     setLoading]     = useState(isEditing);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (!isEditing) return;
    authFetch(`/instructor/quizzes/${quizId}`)
      .then(r => r.json())
      .then(q => {
        if (q._id) {
          setTitle(q.title);
          setDescription(q.description || '');
          setTimeLimit(q.timeLimit || 30);
          setDueDate(q.dueDate ? q.dueDate.substring(0, 10) : '');
          setQuestions(q.questions?.length ? q.questions : [EMPTY_QUESTION()]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  // ── Question helpers ──────────────────────────────────────────────────────

  const addQuestion = () => setQuestions(q => [...q, EMPTY_QUESTION()]);
  const removeQuestion = (qi) => setQuestions(q => q.filter((_, i) => i !== qi));
  const updateQuestion = (qi, field, val) =>
    setQuestions(q => q.map((qu, i) => i !== qi ? qu : { ...qu, [field]: val }));
  const updateOption = (qi, oi, val) =>
    setQuestions(q => q.map((qu, i) => i !== qi ? qu : {
      ...qu, options: qu.options.map((o, j) => j !== oi ? o : val),
    }));
  const addOption = (qi) =>
    setQuestions(q => q.map((qu, i) => i !== qi ? qu : { ...qu, options: [...qu.options, ''] }));
  const removeOption = (qi, oi) =>
    setQuestions(q => q.map((qu, i) => i !== qi ? qu : {
      ...qu, options: qu.options.filter((_, j) => j !== oi),
      correctAnswer: qu.correctAnswer === oi ? 0 : qu.correctAnswer > oi ? qu.correctAnswer - 1 : qu.correctAnswer,
    }));

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!title) return setError('Quiz title is required');
    if (questions.some(q => !q.text)) return setError('All questions must have text');
    setSaving(true); setError('');
    try {
      const body = { title, description, timeLimit: +timeLimit, questions, dueDate: dueDate || null };
      let res;
      if (isEditing) {
        res = await authFetch(`/instructor/quizzes/${quizId}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        res = await authFetch(`/instructor/${courseId}/quizzes`, { method: 'POST', body: JSON.stringify(body) });
      }
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save'); return; }
      setSaved(true);
      setTimeout(() => navigate(`/instructor/course/${courseId}`), 1200);
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this quiz? All student attempts will be lost.')) return;
    await authFetch(`/instructor/quizzes/${quizId}`, { method: 'DELETE' });
    navigate(`/instructor/course/${courseId}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <InstructorSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></main>
    </div>
  );

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <InstructorSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/instructor/course/${courseId}`)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Quiz' : 'New Quiz'}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <button onClick={handleDelete} className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                Delete Quiz
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                saved ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : isEditing ? 'Save Changes' : 'Create Quiz'}
            </button>
          </div>
        </header>

        <div className="p-6 max-w-3xl space-y-6">
          {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{error}</p>}

          {/* Quiz Settings */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Quiz Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Week 3 Quiz — Arrays and Pointers"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (minutes)</label>
                <input
                  type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} min={1}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date (optional)</label>
                <input
                  type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                {/* Question header */}
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Question {qi + 1}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={q.type}
                      onChange={e => updateQuestion(qi, 'type', e.target.value)}
                      className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                    </select>
                    <input
                      type="number" value={q.points} onChange={e => updateQuestion(qi, 'points', +e.target.value)}
                      className="w-16 text-xs text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
                      min={1} title="Points"
                    />
                    <button onClick={() => removeQuestion(qi)} disabled={questions.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Question text */}
                  <textarea
                    value={q.text}
                    onChange={e => updateQuestion(qi, 'text', e.target.value)}
                    rows={2}
                    placeholder="Enter your question here…"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Answer Options — click the circle to mark correct
                    </label>

                    {q.type === 'true_false' ? (
                      <div className="space-y-2">
                        {['True', 'False'].map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuestion(qi, 'correctAnswer', oi)}
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                                q.correctAnswer === oi
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {q.correctAnswer === oi && <Check className="w-3 h-3 text-white mx-auto" />}
                            </button>
                            <span className="text-sm text-gray-900 dark:text-white">{opt}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuestion(qi, 'correctAnswer', oi)}
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                                q.correctAnswer === oi
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {q.correctAnswer === oi && <Check className="w-3 h-3 text-white mx-auto" />}
                            </button>
                            <input
                              value={opt}
                              onChange={e => updateOption(qi, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                            {q.options.length > 2 && (
                              <button onClick={() => removeOption(qi, oi)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {q.options.length < 6 && (
                          <button onClick={() => addOption(qi)} className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1">
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add question */}
            <button
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
