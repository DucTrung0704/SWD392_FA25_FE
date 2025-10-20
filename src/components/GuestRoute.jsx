import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPathForRole } from '../config/constants';

export default function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user && user.role) {
    const target = getDashboardPathForRole(user.role);
    return <Navigate to={target} replace />;
  }
  return children;
}


