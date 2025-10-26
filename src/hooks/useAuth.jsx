import { useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(() => authService.currentUser());

  const refresh = useCallback(() => {
    const currentUser = authService.currentUser();
    console.log('Refreshing auth, current user:', currentUser);
    setUser(currentUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    refresh();
  }, [refresh]);

  useEffect(() => {
    // Initial load - ensure user is set from localStorage
    const storedUser = authService.currentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'app_auth_user') {
        refresh();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refresh]);

  return { user, setUser, refresh, logout };
}
