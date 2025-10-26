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
    // Initial refresh
    refresh();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      refresh();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for localStorage changes (current tab)
    const checkAuthChange = () => {
      const currentUser = authService.currentUser();
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        refresh();
      }
    };
    
    // Poll every 500ms to catch local changes
    const interval = setInterval(checkAuthChange, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refresh, user]);

  return { user, setUser, refresh, logout };
}
