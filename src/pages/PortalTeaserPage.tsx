import { useState } from 'react';
import { ShieldAlert, LogIn, Mail, Lock, Bot, GraduationCap, Server } from 'lucide-react';

export default function PortalTeaserPage() {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="bg-slate-50 min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center" id="portal-teaser-page">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Info Column (Left) */}
        <div className="md:col-span-5 bg-indigo-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950 -z-10"></div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-indigo-200 font-mono text-xs uppercase tracking-wider bg-indigo-950/40 px-3 py-1.5 rounded-full border border-indigo-700/30">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>Auth Blueprint v1.0</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-extrabold text-2xl tracking-tight leading-tight">
                Secure Portal Gateway
              </h2>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Enter your university credentials to access your support logs, chat with the RAG cognitive assistant, or upload documents as an Administrator.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-indigo-800 mt-8 space-y-4 text-xs">
            <div className="flex items-center gap-3 bg-indigo-950/20 p-3 rounded-xl border border-indigo-800/30">
              <Bot className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-indigo-200">
                Phase 2 will activate fully functional <span className="font-bold text-white">JWT + Bcrypt authentication</span> linked with our MongoDB schemas.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-indigo-300">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>UniMind Academic Security Layer</span>
            </div>
          </div>
        </div>

        {/* Login Container Column (Right) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Entrance
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 text-center py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Administrator Portal
            </button>
          </div>

          {/* Form Teaser */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                {activeTab === 'student' ? 'Student Sign-In' : 'Administrative Clearance'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter credentials to sign in. Preview state enabled for Phase 1.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  University Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={activeTab === 'student' ? 'student@unimind.edu' : 'admin@unimind.edu'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm focus:outline-none cursor-not-allowed"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    disabled
                    value="••••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm focus:outline-none cursor-not-allowed"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex gap-3 leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Phase 1 Status Alert</span>
                The database model authentication pathways are currently locked in blueprint mode. Full student/admin dashboards and active session controllers will be integrated in the upcoming Phase.
              </div>
            </div>

            <button
              disabled
              className="w-full py-3.5 bg-indigo-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In (Active in Phase 2)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
