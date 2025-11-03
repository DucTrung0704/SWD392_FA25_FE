import { useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(() => authService.currentUser());

  const refresh = useCallback(() => {
    const currentUser = authService.currentUser();
    console.log('Refreshing auth, current user:', currentUser);
    setUser(currentUser);
    // Trigger a custom event to notify all components
    window.dispatchEvent(new Event('authStateChanged'));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    // Trigger a custom event to notify all components
    window.dispatchEvent(new Event('authStateChanged'));
  }, []);

  useEffect(() => {
    // Initial load - ensure user is set from localStorage
    const storedUser = authService.currentUser();
    setUser(storedUser);
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'app_auth_user' || e.key === null) {
        const currentUser = authService.currentUser();
        setUser(currentUser);
      }
    };
    
    // Listen for custom auth state changes (same tab)
    const handleAuthStateChange = () => {
      const currentUser = authService.currentUser();
      setUser(currentUser);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  return { user, setUser, refresh, logout };
}
