import { useState } from 'react';
import { User as UserIcon, MessageSquare, Ticket as TicketIcon, Bell, Sparkles, LogOut, GraduationCap, ShieldCheck, Mail, Briefcase, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AIChat from '../AIChat';
import TicketHub from '../TicketHub';
import AnnouncementsPanel from './AnnouncementsPanel';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'notifications' | 'profile'>('chat');

  if (!user) return null;

  return (
    <div className="space-y-6" id="student-dashboard">
      {/* Sub Header / Role Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-800/80 border border-indigo-700/60 text-indigo-200 text-xs font-mono font-semibold rounded-full">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
            <span>Student Portal • Role: STUDENT</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
            Access your AI course tutor, view document-based responses, track academic support tickets, and review campus notifications.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-display font-extrabold flex items-center justify-center text-sm shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div className="text-left text-xs">
              <span className="block font-bold text-white max-w-[120px] truncate">{user.name}</span>
              <span className="block text-[10px] text-indigo-200 font-mono">{user.studentId || user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs max-w-3xl" id="student-dashboard-tabs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab-student-chat"
        >
          <MessageSquare className="w-4 h-4" />
          <span>AI Chat & History</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tickets'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab-student-tickets"
        >
          <TicketIcon className="w-4 h-4" />
          <span>Support Tickets</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab-student-notifications"
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
          id="tab-student-profile"
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'chat' && <AIChat />}
      {activeTab === 'tickets' && <TicketHub />}
      {activeTab === 'notifications' && <AnnouncementsPanel />}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-8 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-150">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-display font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">{user.name}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Role: {user.role.toUpperCase()} • Enrolled Student</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                Email Address
              </span>
              <p className="font-semibold text-xs text-slate-800 font-mono">{user.email}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                Academic Department
              </span>
              <p className="font-semibold text-xs text-slate-800">{user.department || 'Computer Science'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                Student ID
              </span>
              <p className="font-semibold text-xs text-slate-800 font-mono">{user.studentId || 'CS-2026-881'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Account Clearance
              </span>
              <p className="font-semibold text-xs text-emerald-700 font-mono uppercase">Verified Student</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-150 flex justify-end">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Portal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
