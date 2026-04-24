// src/hooks/useApi.js
const API = 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

async function handleRes(res) {
  const data = await res.json();
  if (!res.ok) {
    const msg = data.errors
      ? data.errors.map((e) => e.msg).join(', ')
      : data.message || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  me: () =>
    fetch(`${API}/auth/me`, { headers: authHeaders() }).then(handleRes),
};

// ── Users / Profile ───────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () =>
    fetch(`${API}/users`, { headers: authHeaders() }).then(handleRes),

  updateMe: (formData) =>
    fetch(`${API}/users`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    }).then(handleRes),

  changePassword: (body) =>
    fetch(`${API}/users/password`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  updatePreferences: (body) =>
    fetch(`${API}/users/preferences`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  getMyEnrollments: () =>
    fetch(`${API}/users/enrollments`, { headers: authHeaders() }).then(handleRes),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const coursesApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API}/courses${qs ? '?' + qs : ''}`, {
      headers: authHeaders(),
    }).then(handleRes);
  },

  getById: (id) =>
    fetch(`${API}/courses/${id}`, { headers: authHeaders() }).then(handleRes),

  enroll: (courseId) =>
    fetch(`${API}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(handleRes),

  unenroll: (courseId) =>
    fetch(`${API}/courses/${courseId}/enroll`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleRes),

  completeLesson: (courseId, lessonId) =>
    fetch(`${API}/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then(handleRes),
};

// ── Exams ─────────────────────────────────────────────────────────────────────
export const examsApi = {
  getAll: () =>
    fetch(`${API}/exams`, { headers: authHeaders() }).then(handleRes),

  create: (body) =>
    fetch(`${API}/exams`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  update: (id, body) =>
    fetch(`${API}/exams/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  remove: (id) =>
    fetch(`${API}/exams/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to delete exam');
    }),
};

// ── Quizzes ───────────────────────────────────────────────────────────────────
export const quizzesApi = {
  getAll: () =>
    fetch(`${API}/quizzes`, { headers: authHeaders() }).then(handleRes),

  getById: (id) =>
    fetch(`${API}/quizzes/${id}`, { headers: authHeaders() }).then(handleRes),

  submitAttempt: (id, body) =>
    fetch(`${API}/quizzes/${id}/attempts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  getMyAttempt: (id) =>
    fetch(`${API}/quizzes/${id}/attempts/me`, {
      headers: authHeaders(),
    }).then(handleRes),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  send: (body) =>
    fetch(`${API}/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  getAll: () =>
    fetch(`${API}/messages`, { headers: authHeaders() }).then(handleRes),

  markRead: (id) =>
    fetch(`${API}/messages/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(),
    }).then(handleRes),

  remove: (id) =>
    fetch(`${API}/messages/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => { if (!res.ok) throw new Error('Failed to delete'); }),
};

// ── Admin Exams ───────────────────────────────────────────────────────────────
export const adminExamsApi = {
  getAll: () =>
    fetch(`${API}/admin/exams`, { headers: authHeaders() }).then(handleRes),

  create: (body) =>
    fetch(`${API}/admin/exams`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  update: (id, body) =>
    fetch(`${API}/admin/exams/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleRes),

  remove: (id) =>
    fetch(`${API}/admin/exams/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then((res) => { if (!res.ok) throw new Error('Failed to delete'); }),
};
