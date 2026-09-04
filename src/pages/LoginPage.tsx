import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight, Bot, GraduationCap, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { login, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || '/portal';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all email and password parameters.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      // Login handled by redirect useEffect above
    }
  };

  const fillQuickCredentials = (role: 'student' | 'admin') => {
    setLocalError(null);
    if (role === 'student') {
      setEmail('student@unimind.edu');
      setPassword('student123');
    } else {
      setEmail('admin@unimind.edu');
      setPassword('admin123');
    }
  };

  const displayError = localError || error;

  return (
    <div className="bg-slate-50 min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-in fade-in duration-300" id="login-page">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Info Sidebar (Left) */}
        <div className="md:col-span-5 bg-indigo-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950 -z-10"></div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 text-indigo-200 text-xs font-mono tracking-wider uppercase border border-indigo-700/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>JWT persistent core v2</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-extrabold text-2xl tracking-tight leading-tight">
                Secure University Vault
              </h2>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Unlock your individualized UniMind student dashboard, chat history, and active support tickets.
              </p>
            </div>
          </div>

          {/* Quick Tester Assist Box */}
          <div className="mt-8 pt-6 border-t border-indigo-800/80 space-y-3">
            <span className="text-[10px] font-mono tracking-wider uppercase text-indigo-300 font-bold block">
              💡 Hackathon Tester Credentials
            </span>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickCredentials('student')}
                className="bg-indigo-950/40 hover:bg-indigo-950/80 p-2.5 rounded-xl text-left border border-indigo-700/20 hover:border-indigo-600 transition-colors"
              >
                <span className="font-bold text-white block">Student Role</span>
                <span className="text-[10px] text-indigo-300 block font-mono">student@unimind.edu</span>
                <span className="text-[10px] text-indigo-300 block font-mono mt-0.5">student123</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('admin')}
                className="bg-indigo-950/40 hover:bg-indigo-950/80 p-2.5 rounded-xl text-left border border-indigo-700/20 hover:border-indigo-600 transition-colors"
              >
                <span className="font-bold text-white block">Admin Role</span>
                <span className="text-[10px] text-indigo-300 block font-mono">admin@unimind.edu</span>
                <span className="text-[10px] text-indigo-300 block font-mono mt-0.5">admin123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Input Form Column (Right) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900">Sign In to UniMind</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered credentials or select a quick-fill role to continue.
              </p>
            </div>

            {/* Error alerts */}
            {displayError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  University Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="student@unimind.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="login-email-input"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Security Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="login-password-input"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
              id="login-submit-button"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate Securely</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-500 pt-2">
              Don't have a Student Profile yet?{' '}
              <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                Create a Student Account
              </Link>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
