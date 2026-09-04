import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft, Bot, GraduationCap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="bg-slate-50 min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" id="not-found-page">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl border border-slate-200/60 shadow-lg">
        
        {/* Decorative Graphic */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="bg-indigo-50 p-6 rounded-full text-indigo-600 border border-indigo-100">
              <Bot className="w-16 h-16 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-full border-2 border-white shadow-sm">
              404
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight">
            Lost in the Campus Vectors?
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            The neural knowledge base could not find the policy file or route you requested. It might have been relocated 
            or is currently restricted to administrative officers.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="pt-4 flex flex-col gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all duration-300 shadow-md shadow-indigo-100 hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="btn-not-found-home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campus Home</span>
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            id="btn-not-found-about"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Consult Technical Docs</span>
          </Link>
        </div>

        {/* Branding Footer inside Card */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>UniMind AI Cognitive Platform</span>
        </div>

      </div>
    </div>
  );
}
