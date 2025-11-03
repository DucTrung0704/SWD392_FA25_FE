import { AUTH_KEY, ROLES } from '../config/constants';

const API_BASE_URL = '/api';

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

      // Store all tokens from API response
      if (data.token) {
        setStoredToken(data.token);
        localStorage.setItem('accessToken', data.token);
      }
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Store user data
      setStoredUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
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
    // Remove all auth-related data from localStorage
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(`${AUTH_KEY}_token`);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('testDrives');
    
    // Clear all items that start with app_auth or _mui_
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('app_auth') || key.startsWith('_mui_') || key.includes('telemetry'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('Logout: All auth data cleared from localStorage');
  },

  getToken: () => getStoredToken(),

  currentUser: () => getStoredUser(),
  
  // Get user profile from API
  getUserProfile: async () => {
    try {
      const token = getStoredToken() || localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      // Transform API response
      const user = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        createdAt: data.user.createdAt,
        verified: true,
      };

      // Update stored user
      setStoredUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('Profile fetched successfully:', user);
      return user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  // Update user profile with multipart/form-data
  updateUserProfile: async (formData) => {
    try {
      const token = getStoredToken() || localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/user/update`, {
        method: 'PUT',
        headers: {
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // FormData object
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Transform and update stored user
      if (data.user) {
        const user = {
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
          createdAt: data.user.createdAt,
          verified: true,
        };

        setStoredUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('authStateChanged'));
        
        console.log('Profile updated successfully:', user);
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },
  
  // Clear all localStorage (for complete cleanup)
  clearAllStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('All storage cleared');
  },
};
