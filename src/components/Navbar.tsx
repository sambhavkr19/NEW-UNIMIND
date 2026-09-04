import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Menu, X, ArrowRight, Bot, Sparkles, UserCheck } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Team & Tech', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm" id="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group" id="navbar-logo">
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition-all duration-300">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
                  UniMind<span className="text-indigo-600">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold -mt-1 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Hackathon Prototype
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-all duration-200 hover:text-indigo-600 ${
                      isActive ? 'text-indigo-600 font-semibold' : 'text-slate-600'
                    }`
                  }
                  id={`nav-link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-mono border border-slate-100">
                <Bot className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>RAG Active</span>
              </div>
              
              {isAuthenticated && user ? (
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-xl transition-all duration-300 shadow-md shadow-indigo-100"
                  id="btn-portal"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Portal: {user.name.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  id="btn-portal"
                >
                  <span>Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-50 focus:outline-none"
              aria-label="Toggle menu"
              id="navbar-mobile-toggle"
            >
              {isOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <div className="pt-4 pb-2 border-t border-slate-100 px-3">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-500">RAG Cognitive Layer Active</span>
              </div>
              
              {isAuthenticated && user ? (
                <Link
                  to="/portal"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold text-white bg-indigo-900 hover:bg-indigo-950 rounded-xl transition-all shadow-md"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Go to Portal ({user.name})</span>
                </Link>
              ) : (
                <Link
                  to="/portal"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all duration-300"
                >
                  <span>Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
