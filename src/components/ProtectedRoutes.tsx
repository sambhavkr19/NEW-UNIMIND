import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-mono animate-pulse">Checking academic credentials...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-mono animate-pulse">Verifying administration clearance...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdminRole = ['admin', 'college_admin', 'platform_admin'].includes(user?.role || '');

  if (!isAdminRole) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md text-center space-y-4">
          <div className="mx-auto bg-rose-50 text-rose-600 p-4 rounded-full w-14 h-14 flex items-center justify-center border border-rose-100">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-display font-bold text-xl text-slate-900">Restricted Administration Node</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your credentials authorize you as a <strong>Student</strong>. This partition is strictly reserved for certified University Administrators, Advisors, and Registrar Officers.
          </p>
          <div className="pt-2">
            <Navigate to="/portal" replace />
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
