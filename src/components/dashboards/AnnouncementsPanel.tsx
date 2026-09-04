import { useState, useEffect } from 'react';
import { Megaphone, PlusCircle, Trash2, Calendar, User, Tag, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';

export default function AnnouncementsPanel() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'college_admin' || user?.role === 'platform_admin';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New announcement form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [department, setDepartment] = useState('General');
  const [priority, setPriority] = useState<'info' | 'important' | 'urgent'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        setError(data.message || 'Failed to fetch announcements');
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Network error fetching campus announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide title and content for the announcement.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, department, priority }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setSuccess('Announcement published successfully to campus network!');
        setShowCreateModal(false);
        setTitle('');
        setContent('');
        setDepartment('General');
        setPriority('info');
      } else {
        setError(data.message || 'Failed to publish announcement');
      }
    } catch (err) {
      setError('Network error: Could not publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
        setSuccess('Announcement deleted successfully.');
      } else {
        setError(data.message || 'Failed to delete announcement');
      }
    } catch (err) {
      setError('Error deleting announcement');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase rounded-full animate-pulse border border-rose-200">Urgent</span>;
      case 'important':
        return <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-full border border-amber-200">Important</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium uppercase rounded-full border border-slate-200">General Info</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-8 space-y-6" id="announcements-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-150">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="font-display font-extrabold text-xl tracking-tight text-slate-900">
              Campus Notifications & Announcements
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official academic bulletins, exam schedules, and administrative announcements.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
            id="btn-publish-announcement"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Announcement</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 font-bold">×</button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 font-bold">×</button>
        </div>
      )}

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-xs font-mono">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading campus bulletin feeds...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-slate-500 text-xs">
          No active campus announcements at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="p-5 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-2xl transition-all space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(item.priority)}
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                      {item.department}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-slate-900 pt-1">
                    {item.title}
                  </h3>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-200/60 font-mono">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted by: {item.authorName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Admin to Create Announcement */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 bg-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-300" />
                <h3 className="font-display font-bold text-base">New Campus Announcement</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-indigo-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End Semester Exam Timetable Released"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department Scope</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="info">General Info</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Bulletin Announcement Body</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed message regarding dates, schedules, requirements..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Bulletin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
