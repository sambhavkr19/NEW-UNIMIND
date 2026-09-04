import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, Hash, UserPlus, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'college_admin' | 'platform_admin' | 'admin'>('student');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/portal');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name || !email || !password) {
      setLocalError('Please fill in all required name, email, and password parameters.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters in length.');
      return;
    }

    setIsSubmitting(true);
    const success = await register(name, email, password, department, studentId, role);
    setIsSubmitting(false);

    if (success) {
      navigate('/portal');
    }
  };

  const displayError = localError || error;

  return (
    <div className="bg-slate-50 min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-in fade-in duration-300" id="register-page">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Info Sidebar (Left) */}
        <div className="md:col-span-5 bg-indigo-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950 -z-10"></div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 text-indigo-200 text-xs font-mono tracking-wider uppercase border border-indigo-700/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Enrollment v2</span>
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-extrabold text-2xl tracking-tight leading-tight">
                Create Student Identity
              </h2>
              <p className="text-sm text-indigo-200 leading-relaxed">
                Unlock automated university support tickets, personalized academic calendar tracking, and context-aware chat logs instantly.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-indigo-800/80 space-y-4 text-xs">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>UniMind Academic Security Layer</span>
            </div>
          </div>
        </div>

        {/* Input Form Column (Right) */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-900">
                {role === 'admin' ? 'Administrator Registration' : 'Student Portal Registration'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {role === 'admin' 
                  ? 'Fill in administrative staff details to oversee course materials and PDFs.' 
                  : 'Fill in your student credentials to map your academic vectors.'}
              </p>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Choose Account Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200" id="role-select-group">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('college_admin')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === 'college_admin'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  College Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('platform_admin')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === 'platform_admin'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  Platform Dev
                </button>
              </div>
            </div>

            {/* Error alerts */}
            {displayError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={role === 'admin' ? 'Dr. Sarah Jenkins' : 'Jane Doe'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="register-name-input"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  University Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder={role === 'admin' ? 'admin@unimind.edu' : 'student@unimind.edu'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="register-email-input"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Department */}
              <div className={role === 'admin' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {role === 'admin' ? 'Administrative Department' : 'Department / Major'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={role === 'admin' ? 'Academic Affairs' : 'Computer Science'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    id="register-dept-input"
                  />
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Student ID */}
              {role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Student ID Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="CS-2026-904"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      id="register-id-input"
                    />
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Security Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="register-password-input"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
              id="register-submit-button"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{role === 'admin' ? 'Register as Administrator' : 'Enroll as Student'}</span>
                </>
              )}
            </button>

            <div className="text-center text-xs text-slate-500 pt-1">
              Already have an Account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
