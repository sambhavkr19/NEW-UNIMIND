import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, GraduationCap, Cpu, Building2, UserCheck, Sparkles } from 'lucide-react';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import CollegeAdminDashboard from '../components/dashboards/CollegeAdminDashboard';
import PlatformAdminDashboard from '../components/dashboards/PlatformAdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  // Allow overriding displayed role view for testing RBAC UI
  const [viewRole, setViewRole] = useState<'student' | 'college_admin' | 'platform_admin' | null>(null);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-mono text-xs">Loading user security credentials...</p>
      </div>
    );
  }

  // Determine effective role: user's actual role or overridden role view
  const currentRole = viewRole || (user.role === 'admin' ? 'college_admin' : user.role as any) || 'student';

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300" id="dashboard-page-container">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Phase 7 Role Switcher / RBAC Demo Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" id="rbac-demo-bar">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">Role-Based Dashboard (RBAC):</span>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Active User: {user.name} ({user.role})
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewRole('student')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'student' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              onClick={() => setViewRole('college_admin')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'college_admin' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>College Admin</span>
            </button>

            <button
              onClick={() => setViewRole('platform_admin')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                currentRole === 'platform_admin' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Platform Developer</span>
            </button>
          </div>
        </div>

        {/* Render Dashboard based on active role */}
        {currentRole === 'platform_admin' ? (
          <PlatformAdminDashboard />
        ) : currentRole === 'college_admin' ? (
          <CollegeAdminDashboard />
        ) : (
          <StudentDashboard />
        )}

      </div>
    </div>
  );
}
