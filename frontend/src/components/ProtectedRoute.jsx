// ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ requireAdmin = false }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] text-slate-600 flex items-center justify-center">
        Vérification de session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/connexion" replace state={{ from: location }} />
    );
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}