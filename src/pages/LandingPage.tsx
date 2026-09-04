import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Ticket, 
  Users, 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  Compass, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Suggested questions for rapid mock search in front-end
  const suggestions = [
    "When is the hostel check-in date for Fall 2026?",
    "What is the policy for exam re-evaluation?",
    "How do I submit an application for grade appeals?"
  ];

  const mockRAGAnswers: Record<string, { answer: string; confidence: number; source: string }> = {
    "When is the hostel check-in date for Fall 2026?": {
      answer: "Hostel check-in for the Fall 2026 semester begins on Monday, August 24, 2026. All undergraduate residents must complete their online registration and upload medical clearance documents before arrival.",
      confidence: 98,
      source: "Section 3.2 - Student Housing Guidelines 2026"
    },
    "What is the policy for exam re-evaluation?": {
      answer: "Undergraduate Regulation 5.7 states that students may request exam re-evaluation within 14 business days of result declaration. A non-refundable processing fee of $25 is applicable per subject.",
      confidence: 94,
      source: "Academic Catalog 2025-2026 / Exam Policies"
    },
    "How do I submit an application for grade appeals?": {
      answer: "Grade appeals must be submitted online via the Student Portal. Fill out Form Appeal-10A and provide complete graded coursework materials. Your academic advisor must countersign before processing.",
      confidence: 96,
      source: "Section 9 - Student Code of Academic Conduct"
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResult(null);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      // Find matches
      const key = Object.keys(mockRAGAnswers).find(k => k.toLowerCase().includes(query.toLowerCase()));
      if (key) {
        setSearchResult({
          ...mockRAGAnswers[key],
          query: key
        });
      } else {
        setSearchResult({
          answer: "Apologies, this query is not present in our current pre-loaded academic manuals. I will automatically generate a Support Ticket for housing support if requested.",
          confidence: 42,
          source: "No match - Auto-ticketing system trigger criteria met",
          isFallback: true
        });
      }
      setIsSearching(false);
    }, 750);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col" id="landing-page">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-12 left-10 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wide uppercase border border-indigo-100/60 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100 animate-spin-slow" />
            <span>AI Hackathon Winner Blueprint</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto"
          >
            The Intelligent University Helpdesk Powered by <span className="text-indigo-600 relative inline-block">RAG AI</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            UniMind AI helps students instantly resolve queries by pulling answers directly from certified 
            university documents. Confident answers are delivered instantly; everything else triggers an automated support ticket.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link 
              to="/portal" 
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 transition-all duration-300 flex items-center gap-2 group hover:-translate-y-0.5"
            >
              <span>Explore Student Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/about" 
              className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              Learn Tech Stack Architecture
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Interactive RAG Teaser Playground */}
      <section className="py-16 bg-white border-y border-slate-100" id="rag-interactive-teaser">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Instant Knowledge Retrieval (RAG Preview)
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Try searching or clicking a verified university policy guideline below to test the cognitive extraction engine.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask UniMind AI anything about housing, exams, or timelines..."
                className="w-full pl-12 pr-24 py-4 rounded-xl border border-slate-200 bg-white shadow-sm font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                id="rag-teaser-search-input"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-mono font-bold border border-indigo-100">
                Gemini SDK
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-slate-500">Quick Test:</span>
              {suggestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(q)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Simulated Live Search Outcome */}
            {(isSearching || searchResult) && (
              <div className="mt-6 p-5 rounded-xl bg-white border border-slate-100 shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                {isSearching ? (
                  <div className="flex items-center gap-3 py-4">
                    <Bot className="w-6 h-6 text-indigo-600 animate-bounce" />
                    <span className="text-sm font-mono text-slate-500">Retrieving certified knowledge vectors...</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3 text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-600 font-semibold font-mono">
                        <Bot className="w-4 h-4" />
                        <span>UNIMIND COGNITIVE LAYER RESPONDED</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono">Confidence: 
                          <span className={`ml-1 font-bold ${searchResult.confidence > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {searchResult.confidence}%
                          </span>
                        </span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-mono">RAG Mode</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 leading-relaxed font-sans">{searchResult.answer}</p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        Reference: <span className="font-bold text-slate-700">{searchResult.source}</span>
                      </span>
                      {searchResult.isFallback ? (
                        <Link 
                          to="/portal" 
                          className="text-xs px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Raise Support Ticket</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Checked Policy
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20 bg-slate-50" id="platform-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Designed for Campus Excellence
            </h2>
            <p className="mt-4 text-slate-600">
              UniMind AI solves the problem of high support queues in college offices by filtering student demands 
              through deep retrieval systems before transferring control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Secure Student Auth</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Supports role-based authorization rules separating Students and Administrators cleanly. Access custom profiles, secure JWT verification, and credential protection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Knowledge Document RAG</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                Upload PDFs of notices, curricula, examination rules, or hostel lists. The system converts raw documents into semantic search vectors via Gemini embedding layers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Automated Ticketing</h3>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                When the AI has low confidence, it seamlessly opens a ticket. No extra manual typing required—the system auto-populates details and routes it to housing or registrar queues.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Platform Real-Time Telemetry Stats */}
      <section className="bg-indigo-900 text-white py-16 relative overflow-hidden" id="cognitive-telemetry">
        <div className="absolute inset-0 bg-indigo-950/60 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            
            <div className="p-4 bg-indigo-800/20 rounded-xl border border-indigo-700/30">
              <div className="text-3xl sm:text-4xl font-display font-black text-indigo-300">0.4s</div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-200 mt-2">Vector Search Latency</div>
            </div>

            <div className="p-4 bg-indigo-800/20 rounded-xl border border-indigo-700/30">
              <div className="text-3xl sm:text-4xl font-display font-black text-indigo-300">92%</div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-200 mt-2">Ticket Reduction Rate</div>
            </div>

            <div className="p-4 bg-indigo-800/20 rounded-xl border border-indigo-700/30">
              <div className="text-3xl sm:text-4xl font-display font-black text-indigo-300">100%</div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-200 mt-2">Certified Policy Grounding</div>
            </div>

            <div className="p-4 bg-indigo-800/20 rounded-xl border border-indigo-700/30">
              <div className="text-3xl sm:text-4xl font-display font-black text-indigo-300">Gemini 2.5</div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-200 mt-2">Intelligence Core</div>
            </div>

          </div>
        </div>
      </section>

      {/* Static FAQ Accordion Area */}
      <section className="py-20 bg-white" id="faq-accordions">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Campus FAQs</h2>
            <p className="text-slate-500 mt-2">Common administrative questions answered by the UniMind knowledge base.</p>
          </div>

          <div className="space-y-4">
            
            <div className="p-5 rounded-xl border border-slate-200 hover:border-indigo-500 transition-colors bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">How does the automatic ticket routing determine categories?</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                The AI reads the semantic intention of the question. Depending on core references (e.g. "payment", "grades", "room"), it classifies tickets into Finance, Examinations, or Housing automatically.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 hover:border-indigo-500 transition-colors bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Who evaluates support tickets?</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Assigned administrative staff are given an intuitive queue view under the Admin Dashboard to address, re-route, comment on, and resolve tickets instantly.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 hover:border-indigo-500 transition-colors bg-slate-50/50">
              <h3 className="font-semibold text-slate-900">Can other documents be uploaded?</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Yes! Admins can upload any PDF guidelines or text documents dynamically under the management board. Once uploaded, the vector mapping rebuilds in the background.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
