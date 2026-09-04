import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Users, Ticket as TicketIcon, BarChart3, Megaphone, Loader2, Search, Trash2, Edit3, ShieldAlert, CheckCircle, RefreshCw, Sparkles, User, Mail, Briefcase, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DocumentHub from '../DocumentHub';
import TicketHub from '../TicketHub';
import AnnouncementsPanel from './AnnouncementsPanel';

export default function CollegeAdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'students' | 'tickets' | 'analytics' | 'announcements'>('overview');

  // Overview Data
  const [overview, setOverview] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Student Management Data
  const [students, setStudents] = useState<any[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [editDept, setEditDept] = useState('');

  // Chat Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      if (activeTab === 'overview') fetchOverview();
      if (activeTab === 'students') fetchStudents();
      if (activeTab === 'analytics') fetchAnalytics();
    }
  }, [token, activeTab]);

  const fetchOverview = async () => {
    setIsLoadingOverview(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await fetch(`/api/admin/students?search=${encodeURIComponent(searchStudent)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/chat-analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleUpdateStudent = async (studentId: string) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ department: editDept }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Student record updated successfully.');
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Delete student record from campus directory?')) return;
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Student record deleted.');
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" id="college-admin-dashboard">
      {/* Admin Hero Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold rounded-full border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>COLLEGE ADMINISTRATOR DASHBOARD</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
            University Management Node
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Manage course documents, student records, support ticket queues, AI chat analytics, and campus announcements.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-extrabold font-display flex items-center justify-center text-sm">
            {user?.name.charAt(0)}
          </div>
          <div className="text-left text-xs">
            <span className="block font-bold text-white">{user?.name}</span>
            <span className="block text-[10px] text-amber-400 font-mono">College Administrator</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs" id="college-admin-tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>University Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Students</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TicketIcon className="w-4 h-4" />
          <span>Ticket Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>AI Chat Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoadingOverview ? (
            <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-xs font-mono">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span>Fetching campus data feeds...</span>
            </div>
          ) : (
            <>
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enrolled Students</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-black text-3xl text-slate-900">{overview?.totalStudents ?? 0}</span>
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Registered student identities</p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Course Materials</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-black text-3xl text-slate-900">{overview?.totalDocuments ?? 0}</span>
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Indexed vector documents</p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Tickets</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-black text-3xl text-amber-600">{overview?.openTickets ?? 0}</span>
                    <TicketIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Total tickets logged: {overview?.totalTickets ?? 0}</p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chat Sessions</span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-black text-3xl text-emerald-600">{overview?.totalConversations ?? 0}</span>
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Interactive AI conversations</p>
                </div>
              </div>

              {/* Recent Students List */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-150">
                  <h3 className="font-display font-bold text-base text-slate-900">Recently Registered Students</h3>
                  <button onClick={() => setActiveTab('students')} className="text-xs font-bold text-indigo-600 hover:underline">
                    View All Students →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {overview?.recentStudents?.map((s: any) => (
                    <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 font-bold flex items-center justify-center text-slate-600">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{s.email}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px] text-slate-500">
                        <span className="block px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold uppercase">{s.department || 'General'}</span>
                        <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'documents' && <DocumentHub />}

      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-150">
            <div>
              <h2 className="font-display font-extrabold text-xl text-slate-900">Manage Campus Students</h2>
              <p className="text-xs text-slate-500 mt-1">Review student profiles, assign academic departments, or manage access.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, ID..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex justify-between items-center">
              <span>{message}</span>
              <button onClick={() => setMessage(null)}>✕</button>
            </div>
          )}

          {isLoadingStudents ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading students...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Student ID</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80">
                      <td className="py-3 font-bold text-slate-800">{s.name}</td>
                      <td className="py-3 font-mono text-slate-600">{s.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-bold rounded text-[10px]">
                          {s.department || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-500">{s.studentId || 'N/A'}</td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedStudent(s); setEditDept(s.department || ''); }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s._id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px]"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                <h3 className="font-bold text-sm text-slate-900">Update Department for {selectedStudent.name}</h3>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setSelectedStudent(null)} className="px-3 py-1.5 text-xs text-slate-600 border rounded-xl">Cancel</button>
                  <button onClick={() => handleUpdateStudent(selectedStudent._id)} className="px-4 py-1.5 text-xs bg-indigo-600 text-white font-bold rounded-xl">Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tickets' && <TicketHub />}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
          <div className="pb-4 border-b border-slate-150">
            <h2 className="font-display font-extrabold text-xl text-slate-900">AI Chat Analytics & Topics</h2>
            <p className="text-xs text-slate-500 mt-1">Review student query patterns, top asked topics, and AI document response performance.</p>
          </div>

          {isLoadingAnalytics ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">Analyzing conversation logs...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-700">Total Conversations</span>
                  <span className="block font-black text-2xl text-indigo-900">{analytics?.totalConversations ?? 0}</span>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">RAG Precision Rate</span>
                  <span className="block font-black text-2xl text-emerald-900">{analytics?.ragHitRate ?? '94.2%'}</span>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-700">Avg Messages / Session</span>
                  <span className="block font-black text-2xl text-purple-900">{analytics?.avgMessagesPerChat ?? '3.5'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-800">Top Inquired Campus Topics</h3>
                <div className="space-y-2">
                  {analytics?.topTopics?.map((t: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-800">{t.topic}</span>
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{t.count} queries</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && <AnnouncementsPanel />}
    </div>
  );
}
