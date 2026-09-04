import { 
  Cpu, 
  Database, 
  Layout, 
  Workflow, 
  Github, 
  Linkedin, 
  Server, 
  FileCheck, 
  HelpCircle,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutPage() {
  const techStack = [
    {
      category: 'Frontend Client',
      icon: <Layout className="w-6 h-6 text-indigo-600" />,
      items: [
        { name: 'React 19', desc: 'Modern Declarative Components' },
        { name: 'Vite 6', desc: 'Instant Developer Tooling & Bundling' },
        { name: 'Tailwind CSS v4', desc: 'Utility-first Typography & Themes' },
        { name: 'React Router v6', desc: 'Declarative SPA Navigation Routing' }
      ]
    },
    {
      category: 'Backend Server',
      icon: <Server className="w-6 h-6 text-indigo-600" />,
      items: [
        { name: 'Node.js & Express', desc: 'Secure RESTful Endpoint Gateway' },
        { name: 'Mongoose & MongoDB', desc: 'Dynamic Schema Modeling & Storage' },
        { name: 'JSON Web Token (JWT)', desc: 'Secure Role-based User Sign-in' },
        { name: 'Logger & Global Errors', desc: 'Production-ready System Safety' }
      ]
    },
    {
      category: 'Artificial Intelligence',
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
      items: [
        { name: 'Google GenAI SDK', desc: 'Official SDK for Gemini 2.5/Flash' },
        { name: 'RAG Architecture', desc: 'Context-grounded Academic Extraction' },
        { name: 'Semantic Thresholds', desc: 'Auto-ticket Generation on Uncertainty' },
        { name: 'Document Chunking', desc: 'Clean parsing of uploaded PDF resources' }
      ]
    }
  ];

  const workflowSteps = [
    {
      title: 'Upload Materials',
      desc: 'Administrators drag & drop university handbook PDFs or notices in their dashboard, chunking the content.'
    },
    {
      title: 'Vector Generation',
      desc: 'Documents are processed via Gemini text embedding APIs and stored in our database index.'
    },
    {
      title: 'Contextual Search',
      desc: 'When students query, the system fetches the most relevant text chunks from our manuals.'
    },
    {
      title: 'Grounding & Ticket Fallback',
      desc: 'If matching context is found, Gemini outputs an answered quote. Otherwise, it logs a support ticket.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-16" id="about-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-4 border border-indigo-100">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hackathon Winner Architecture</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Meet UniMind AI
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            UniMind AI was conceptualized to bridge the gap between static academic guidelines and dynamic student requirements. 
            By leveraging certified RAG pipelines, we prevent administrative burn-out on campus.
          </p>
        </div>

        {/* How it Works / Workflow */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm mb-16" id="about-workflow">
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-8 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-indigo-600" />
            <span>Core Cognitive Workflow</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, index) => (
              <div key={index} className="relative p-5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="absolute -top-4 left-4 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm shadow-md shadow-indigo-100">
                  0{index + 1}
                </span>
                <h3 className="font-semibold text-slate-900 mt-2 mb-2 text-base">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mb-16">
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight text-center mb-10">
            Engineered with a Production-Ready Tech Stack
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="about-tech-stack">
            {techStack.map((stack, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                  <div className="bg-indigo-50 p-2.5 rounded-xl">
                    {stack.icon}
                  </div>
                  <h3 className="font-display font-bold text-slate-900 text-lg">{stack.category}</h3>
                </div>

                <div className="space-y-4">
                  {stack.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-indigo-900 rounded-3xl text-white p-8 md:p-12 shadow-xl relative overflow-hidden" id="about-team">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full blur-3xl -z-0 opacity-40"></div>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">The Team Behind UniMind AI</h2>
            <p className="mt-4 text-indigo-200 text-sm sm:text-base leading-relaxed">
              We are a team of dedicated developers, artificial intelligence researchers, and university alumni. 
              We designed this prototype for the Google AI Hackathon to solve practical student support challenges 
              faced daily by millions of undergrads around the world.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-indigo-800 flex items-center justify-center text-xl font-bold border-2 border-indigo-500 shadow-md">
                  🚀
                </div>
                <span className="font-semibold text-sm mt-2 text-white">Full-Stack AI Team</span>
                <span className="text-xs text-indigo-300">Engineering & UX Leads</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
