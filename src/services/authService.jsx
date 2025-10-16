import { AUTH_KEY, ROLES } from '../config/constants';

function getStoredUser() {
  const raw = localStorage.getItem(AUTH_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export const authService = {
  loginWithCredentials: async (email, password) => {
    if (!email || !password) throw new Error('Missing credentials');
    // Mock admin/teacher/student
    const role = email.includes('teacher')
      ? ROLES.Teacher
      : email.includes('admin')
      ? ROLES.Admin
      : ROLES.Student;
    const user = { id: Date.now(), name: email.split('@')[0], email, role, verified: role !== ROLES.Teacher ? true : email.includes('verified') };
    setStoredUser(user);
    return user;
  },

  loginWithGoogle: async () => {
    const user = { id: Date.now(), name: 'Google User', email: 'google.user@example.com', role: ROLES.Student, verified: true, oauth: 'google' };
    setStoredUser(user);
    return user;
  },

  registerStudent: async (name, email, password) => {
    if (!name || !email || !password) throw new Error('Missing fields');
    const user = { id: Date.now(), name, email, role: ROLES.Student, verified: true };
    setStoredUser(user);
    return user;
  },

  registerTeacher: async (name, email, password, verificationInfo) => {
    if (!name || !email || !password) throw new Error('Missing fields');
    const user = { id: Date.now(), name, email, role: ROLES.Teacher, verified: false, verificationInfo };
    setStoredUser(user);
    return user;
  },

  forgotPassword: async (email) => {
    if (!email) throw new Error('Email required');
    return { message: 'Password reset link sent (mock).' };
  },

  logout: async () => {
    localStorage.removeItem(AUTH_KEY);
  },

  currentUser: () => getStoredUser(),
};
