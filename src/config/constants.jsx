export const ROLES = {
  Admin: 'Admin',
  Teacher: 'Teacher',
  Student: 'Student',
};

export const ROUTES = {
  home: '/',
  login: '/login',
  registerStudent: '/register/student',
  registerTeacher: '/register/teacher',
  forgotPassword: '/forgot-password',
  flashcards: '/flashcards',
  exams: '/exams',
  profile: '/profile',
};

export const THEME_KEY = 'app_theme_preference';
export const AUTH_KEY = 'app_auth_user';

// Role dashboard mapping and helper
export const ROLE_DASHBOARD = {
  [ROLES.Admin]: '/dashboard/admin',
  [ROLES.Teacher]: '/dashboard/teacher',
  [ROLES.Student]: '/dashboard/student',
};

export function getDashboardPathForRole(role) {
  return ROLE_DASHBOARD[role] || ROUTES.home;
}