// src/pages/HelpPage.jsx
import { useState } from 'react';
import { MessageCircle, Send, CheckCircle, Loader2, HelpCircle, BookOpen, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { messagesApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const TOPICS = [
  { value: 'enrollment',   label: 'Enrollment Issue' },
  { value: 'course',       label: 'Course Content'   },
  { value: 'technical',    label: 'Technical Problem' },
  { value: 'grade',        label: 'Grade / Progress'  },
  { value: 'other',        label: 'Other'             },
];

const FAQS = [
  {
    q: 'How do I enroll in a course?',
    a: 'Go to the Courses page, find the course you want, and click the "Enroll" button on the course card.',
  },
  {
    q: 'How do I mark a lesson as complete?',
    a: 'Open a course, click on a lesson in the sidebar, watch it, then click "Mark as Complete" at the bottom of the lesson viewer.',
  },
  {
    q: 'Can I drop a course after enrolling?',
    a: 'Yes — go to Courses, find the enrolled course (it will have a green border), and click "Drop". Note that your progress will be lost.',
  },
  {
    q: 'Where do I see my exam schedule?',
    a: 'Go to the Calendar page. Admin-set exams for your enrolled courses appear automatically. You can also add personal reminders.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to Settings → Security tab and use the Change Password form.',
  },
];

export default function HelpPage({ isDarkMode, toggleTheme }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name:    user?.name  || '',
    email:   user?.email || '',
    subject: '',
    topic:   '',
    body:    '',
  });
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState('');
  const [openFaq,   setOpenFaq]   = useState(null);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.body) { setError('Subject and message are required.'); return; }
    setSending(true); setError('');
    try {
      const subject = form.topic ? `[${TOPICS.find(t => t.value === form.topic)?.label}] ${form.subject}` : form.subject;
      await messagesApi.send({ name: form.name, email: form.email, subject, body: form.body });
      setSent(true);
      setForm(p => ({ ...p, subject: '', topic: '', body: '' }));
    } catch (err) {
      setError(err.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Get help from our admin team or browse common questions</p>
        </header>

        <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Contact Form ── */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Send a Message</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admins will review your message</p>
                </div>
              </div>

              {sent && (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Message sent!</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Our team will get back to you soon.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                    <input value={form.name} onChange={set('name')}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={set('email')}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                  <select value={form.topic} onChange={set('topic')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select a topic…</option>
                    {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject <span className="text-red-500">*</span></label>
                  <input value={form.subject} onChange={set('subject')} placeholder="What is this about?"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Message <span className="text-red-500">*</span></label>
                  <textarea value={form.body} onChange={set('body')} rows={5}
                    placeholder="Describe your issue in detail…"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>

                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quick answers to common questions</p>
                </div>
              </div>

              <div className="space-y-2">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white pr-4">{faq.q}</span>
                      <span className={`text-gray-400 text-lg flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Quick Links
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Browse Courses',   path: '/courses'   },
                  { label: 'My Dashboard',     path: '/dashboard' },
                  { label: 'Exam Calendar',    path: '/calendar'  },
                  { label: 'Account Settings', path: '/settings'  },
                ].map(({ label, path }) => (
                  <a key={path} href={path}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group">
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{label}</span>
                    <span className="text-gray-400 group-hover:text-blue-500">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
