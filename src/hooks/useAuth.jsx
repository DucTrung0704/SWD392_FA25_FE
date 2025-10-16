import { useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(() => authService.currentUser());

  const refresh = useCallback(() => {
    setUser(authService.currentUser());
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, setUser, refresh, logout };
}
