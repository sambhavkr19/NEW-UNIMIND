import { useState, useEffect } from 'react';
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  PlusCircle, 
  Trash2, 
  User, 
  Mail, 
  Search, 
  Loader2, 
  Check, 
  X, 
  AlertTriangle,
  ChevronDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface ClientSupportTicket {
  _id: string;
  studentId: string | { _id: string; name: string };
  studentName: string;
  studentEmail: string;
  title: string;
  question: string;
  department: 'academic' | 'hostel' | 'examination' | 'finance' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export default function TicketHub() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State Management
  const [tickets, setTickets] = useState<ClientSupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Manual Ticket Creation Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newDept, setNewDept] = useState<'academic' | 'hostel' | 'examination' | 'finance' | 'general'>('general');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected ticket for detailed modal view
  const [selectedTicket, setSelectedTicket] = useState<ClientSupportTicket | null>(null);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.tickets);
      } else {
        setError(data.message || 'Failed to fetch tickets list');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Network error: Could not connect to support ticketing server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      setError('Please provide a description/question for the support ticket.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle.trim() || undefined,
          question: newQuestion.trim(),
          department: newDept,
          priority: newPriority
        })
      });

      const data = await response.json();
      if (data.success) {
        setTickets(prev => [data.ticket, ...prev]);
        setSuccessMsg('Support ticket logged successfully! A support agent will review it shortly.');
        setShowCreateModal(false);
        // Reset form
        setNewTitle('');
        setNewQuestion('');
        setNewDept('general');
        setNewPriority('medium');
      } else {
        setError(data.message || 'Failed to log support ticket.');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to contact server to log ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, updates: Partial<ClientSupportTicket>) => {
    setUpdatingTicketId(ticketId);
    setError(null);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t._id === ticketId ? data.ticket : t));
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(data.ticket);
        }
        setSuccessMsg('Ticket updated successfully!');
      } else {
        setError(data.message || 'Failed to update ticket.');
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError('Network error: Could not update ticket on server.');
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this support ticket?')) {
      return;
    }

    setError(null);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setTickets(prev => prev.filter(t => t._id !== ticketId));
        setSuccessMsg('Ticket deleted successfully.');
        setSelectedTicket(null);
      } else {
        setError(data.message || 'Failed to delete ticket.');
      }
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('Network error: Could not delete ticket.');
    }
  };

  // Filter & Search Logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesDept = deptFilter === 'all' || ticket.department === deptFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesPriority;
  });

  const getStatusBadge = (status: ClientSupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold font-mono uppercase rounded-full">Open</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold font-mono uppercase rounded-full">In Progress</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono uppercase rounded-full">Resolved</span>;
      case 'closed':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold font-mono uppercase rounded-full">Closed</span>;
    }
  };

  const getPriorityBadge = (priority: ClientSupportTicket['priority']) => {
    switch (priority) {
      case 'low':
        return <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-semibold font-mono rounded-md">Low Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold font-mono rounded-md">Medium Priority</span>;
      case 'high':
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold font-mono rounded-md">High Priority</span>;
      case 'urgent':
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold font-mono uppercase animate-pulse rounded-md">Urgent</span>;
    }
  };

  const getDeptColor = (dept: ClientSupportTicket['department']) => {
    switch (dept) {
      case 'academic': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'examination': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'finance': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'hostel': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'general': return 'bg-slate-50 text-slate-700 border-slate-150';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-8 space-y-6" id="ticket-hub-workspace">
      
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-150">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TicketIcon className="w-5 h-5" />
            </div>
            <h1 className="font-display font-extrabold text-xl tracking-tight text-slate-900">
              {isAdmin ? 'University Support Ticket Queue' : 'My Support Tickets'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin 
              ? 'Review and manage auto-logged and manual administrative tickets from students.' 
              : 'Track helpdesk inquiries generated automatically when our AI identifies knowledge gaps.'}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchTickets}
            className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
            title="Refresh list"
            id="btn-refresh-tickets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {!isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-grow sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100 cursor-pointer"
              id="btn-create-ticket-trigger"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Support Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-grow">
            <span className="font-semibold">Operation Alert:</span> {error}
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-grow">
            <span className="font-semibold">Success:</span> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Area */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isAdmin ? "Search by student, query..." : "Search tickets..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            id="ticket-search-input"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 text-xs appearance-none border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
            id="ticket-filter-status"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 text-xs appearance-none border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
            id="ticket-filter-department"
          >
            <option value="all">All Departments</option>
            <option value="academic">Academic Affairs</option>
            <option value="examination">Examinations Office</option>
            <option value="finance">Finance / Registrar</option>
            <option value="hostel">Hostels & Housing</option>
            <option value="general">General Support</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full pl-3.5 pr-8 py-2.5 text-xs appearance-none border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
            id="ticket-filter-priority"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3 font-mono text-xs">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span>Refreshing secure ticketing index...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-150">
            <TicketIcon className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-display font-semibold text-slate-800 text-sm">No Support Tickets Logged</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || statusFilter !== 'all' || deptFilter !== 'all' || priorityFilter !== 'all'
                ? "No support tickets match the current search filters."
                : "You do not have any registered support tickets. When you ask the AI helper questions not resolved by university documents, tickets are automatically created."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="ticket-items-grid">
          {filteredTickets.map((ticket) => (
            <motion.div
              layoutId={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              key={ticket._id}
              className="bg-slate-50 hover:bg-white border border-slate-150 hover:border-slate-200 p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between gap-4 group hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-bold font-mono uppercase shrink-0 ${getDeptColor(ticket.department)}`}>
                    {ticket.department}
                  </span>
                  <div className="flex gap-1.5 items-center">
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {ticket.question}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold font-mono text-slate-600 uppercase">
                    {ticket.studentName.charAt(0)}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{ticket.studentName}</span>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Manual Ticket Creation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
              id="create-ticket-modal"
            >
              <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-indigo-900 text-white">
                <div className="flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-indigo-300" />
                  <h2 className="font-display font-bold text-md text-white">Log Formal Support Request</h2>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-indigo-200 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-6 space-y-4 flex-grow overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Request Subject (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Hostel Refund Delayed"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Department</label>
                    <div className="relative">
                      <select
                        value={newDept}
                        onChange={(e: any) => setNewDept(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 text-xs appearance-none border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="academic">Academic Affairs</option>
                        <option value="examination">Examinations Office</option>
                        <option value="finance">Finance / Registrar</option>
                        <option value="hostel">Hostels & Housing</option>
                        <option value="general">General Support</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Urgency Priority</label>
                    <div className="relative">
                      <select
                        value={newPriority}
                        onChange={(e: any) => setNewPriority(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2.5 text-xs appearance-none border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Description of Issue / Inquiry</label>
                  <textarea
                    rows={4}
                    placeholder="Please specify dates, deadlines, registration codes, or details regarding your administrative concern..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-150 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Logging ticket...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Submit Formal Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Details View & Admin Controls Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
              id="ticket-details-modal"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-950 text-white">
                <div className="flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="font-display font-bold text-sm text-white line-clamp-1">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">Ticket Identifier: {selectedTicket._id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Meta details strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Status</span>
                    <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Priority</span>
                    <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Department</span>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded border text-[10px] font-bold font-mono uppercase ${getDeptColor(selectedTicket.department)}`}>
                      {selectedTicket.department}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Logged Date</span>
                    <span className="block mt-1 font-mono text-slate-700 font-semibold">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Question/Content Box */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Original Inquiry / Problem Statement</span>
                  <div className="bg-slate-50/50 p-4 border border-slate-150 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.question}
                  </div>
                </div>

                {/* Student Info Box */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Student Identity Profile</span>
                  <div className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-2xl text-xs text-slate-600 bg-indigo-50/20">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="block text-[9px] text-slate-400">Student Name</span>
                        <span className="font-bold text-slate-800">{selectedTicket.studentName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="block text-[9px] text-slate-400">Student Email Address</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedTicket.studentEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Management Section */}
                {isAdmin ? (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-900">University Administrator Controls</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Change Status */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Update Status</label>
                        <select
                          value={selectedTicket.status}
                          onChange={(e: any) => handleUpdateTicketStatus(selectedTicket._id, { status: e.target.value })}
                          disabled={updatingTicketId === selectedTicket._id}
                          className="w-full text-xs py-2 px-2.5 bg-white border border-indigo-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      {/* Change Priority */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Update Priority</label>
                        <select
                          value={selectedTicket.priority}
                          onChange={(e: any) => handleUpdateTicketStatus(selectedTicket._id, { priority: e.target.value })}
                          disabled={updatingTicketId === selectedTicket._id}
                          className="w-full text-xs py-2 px-2.5 bg-white border border-indigo-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>

                      {/* Change Department */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Re-route Department</label>
                        <select
                          value={selectedTicket.department}
                          onChange={(e: any) => handleUpdateTicketStatus(selectedTicket._id, { department: e.target.value })}
                          disabled={updatingTicketId === selectedTicket._id}
                          className="w-full text-xs py-2 px-2.5 bg-white border border-indigo-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                        >
                          <option value="academic">Academic Affairs</option>
                          <option value="examination">Examinations Office</option>
                          <option value="finance">Finance / Registrar</option>
                          <option value="hostel">Hostels & Housing</option>
                          <option value="general">General Support</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Student actions
                  selectedTicket.status !== 'closed' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleUpdateTicketStatus(selectedTicket._id, { status: 'closed' })}
                        disabled={updatingTicketId === selectedTicket._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        id="btn-student-close-ticket"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Request as Resolved / Closed</span>
                      </button>
                    </div>
                  )
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-150 flex justify-between items-center">
                <div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTicket(selectedTicket._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold rounded-xl transition-all cursor-pointer border border-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Ticket</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
