import { GraduationCap, Github, Twitter, Linkedin, Heart, HelpCircle, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white" id="footer-logo">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                UniMind<span className="text-indigo-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              UniMind AI is an Intelligent Helpdesk designed for modern universities. Empowering students with secure, 
              RAG-optimized AI search capabilities and automated service ticketing, while providing admins 
              with powerful workflow and notice controls.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors" aria-label="Github">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors" aria-label="Linkedin">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Team & Stack</Link>
              </li>
              <li>
                <Link to="/portal" className="hover:text-white transition-colors">Student Portal</Link>
              </li>
            </ul>
          </div>

          {/* Core Architecture Meta */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">Architecture</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <div className="text-[11px] font-mono leading-tight">
                  <span className="block text-slate-300 font-bold">Node.js + Express</span>
                  <span className="text-slate-500">REST API Core v1.0</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <div className="text-[11px] font-mono leading-tight">
                  <span className="block text-slate-300 font-bold">MongoDB Atlas</span>
                  <span className="text-slate-500">Mongoose Layer Active</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>&copy; {currentYear} UniMind AI. Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for the Google AI Hackathon.</span>
          </div>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Status: Online
            </span>
            <span className="text-slate-600 font-mono">Build v1.0.0 (Phase 1)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
