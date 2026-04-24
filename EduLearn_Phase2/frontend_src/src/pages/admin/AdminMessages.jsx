// src/pages/admin/AdminMessages.jsx
import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Loader2, MessageCircle, Tag } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminMessages({ isDarkMode, toggleTheme }) {
  const { authFetch } = useAuth();
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState('all'); // 'all' | 'unread'

  const fetchMessages = () => {
    setLoading(true);
    authFetch('/messages')
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSelect = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      await authFetch(`/messages/${msg._id}/read`, { method: 'PATCH' });
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
    }
  };

  const handleDelete = async (id) => {
    await authFetch(`/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const displayed = filter === 'unread' ? messages.filter(m => !m.read) : messages;
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AdminSidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Messages
              {unreadCount > 0 && (
                <span className="text-sm font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Student help requests and messages</p>
          </div>
          <div className="flex gap-2">
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Message list */}
          <div className="w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto bg-white dark:bg-gray-950">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MessageCircle className="w-10 h-10 mb-3" />
                <p className="text-sm">{filter === 'unread' ? 'No unread messages' : 'No messages yet'}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {displayed.map(msg => (
                  <li key={msg._id}>
                    <button
                      onClick={() => handleSelect(msg)}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                        selected?._id === msg._id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className={`text-sm truncate ${msg.read ? 'text-gray-600 dark:text-gray-400' : 'font-semibold text-gray-900 dark:text-white'}`}>
                              {msg.from?.name || msg.name || 'Unknown'}
                            </p>
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${msg.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                            {msg.subject}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{msg.body}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Message detail */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {selected ? (
              <div className="p-6 max-w-2xl">
                <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{selected.subject}</h2>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {selected.from?.email || selected.email}
                        </span>
                        <span>{new Date(selected.createdAt).toLocaleString()}</span>
                        {selected.course && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Tag className="w-3.5 h-3.5" /> {selected.course.title}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(selected._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sender info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-5">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        {(selected.from?.name || selected.name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selected.from?.name || selected.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selected.from?.role || 'student'}</p>
                    </div>
                    {selected.read
                      ? <MailOpen className="w-4 h-4 text-gray-400 ml-auto" />
                      : <Mail className="w-4 h-4 text-blue-500 ml-auto" />}
                  </div>

                  {/* Body */}
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{selected.body}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Mail className="w-12 h-12 mb-3" />
                <p className="text-sm">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
