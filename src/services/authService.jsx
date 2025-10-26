import { AUTH_KEY, ROLES } from '../config/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

function getStoredToken() {
  return localStorage.getItem(`${AUTH_KEY}_token`);
}

function setStoredToken(token) {
  localStorage.setItem(`${AUTH_KEY}_token`, token);
}

export const authService = {
  loginWithCredentials: async (email, password) => {
    if (!email || !password) throw new Error('Missing credentials');
    
    try {
      // Call real API
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Transform API response to match expected format
      const user = {
        id: data.user.id || data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role, // Get role from API response
        avatar: data.user.avatar,
        verified: true,
      };

      // Store token separately
      if (data.token) {
        setStoredToken(data.token);
      }

      setStoredUser(user);
      console.log('Login successful, user role:', user.role);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
  },

  loginWithGoogle: async () => {
    const user = { id: Date.now(), name: 'Google User', email: 'google.user@example.com', role: ROLES.Student, verified: true, oauth: 'google' };
    setStoredUser(user);
    return user;
  },

  registerStudent: async (name, email, password) => {
    if (!name || !email || !password) throw new Error('Missing fields');
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: 'Student' 
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Transform API response
      const user = {
        id: data.user?.id || data.user?._id || Date.now(),
        name: data.user?.name || name,
        email: data.user?.email || email,
        role: data.user?.role || ROLES.Student,
        avatar: data.user?.avatar,
        verified: true,
      };

      // Store token if available
      if (data.token) {
        setStoredToken(data.token);
        setStoredUser(user);
      }

      console.log('Student registration successful');
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  registerTeacher: async (name, email, password) => {
    if (!name || !email || !password) throw new Error('Missing fields');
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: 'Teacher'
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Transform API response
      const user = {
        id: data.user?.id || data.user?._id || Date.now(),
        name: data.user?.name || name,
        email: data.user?.email || email,
        role: data.user?.role || ROLES.Teacher,
        avatar: data.user?.avatar,
        verified: true,
      };

      // Store token if available
      if (data.token) {
        setStoredToken(data.token);
        setStoredUser(user);
      }

      console.log('Teacher registration successful');
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  },

  forgotPassword: async (email) => {
    if (!email) throw new Error('Email required');
    return { message: 'Password reset link sent (mock).' };
  },

  logout: async () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(`${AUTH_KEY}_token`);
  },

  getToken: () => getStoredToken(),

  currentUser: () => getStoredUser(),
};
