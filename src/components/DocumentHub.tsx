import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  Loader2, 
  Calendar, 
  Database, 
  Eye, 
  X,
  FileCheck,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface DocumentInfo {
  _id: string;
  title: string;
  filename: string;
  originalName: string;
  size: number;
  createdAt: string;
}

export default function DocumentHub() {
  const { user, token, login } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State Management
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      } else {
        setError(data.message || 'Failed to fetch documents list');
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Network error: Could not reach document registry server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitchToAdmin = async () => {
    setIsSwitching(true);
    setError(null);
    try {
      const success = await login('admin@unimind.edu', 'admin123');
      if (success) {
        setSuccessMsg('Successfully switched to University Administrator! The PDF Uploader workspace is now unlocked.');
      } else {
        setError('Failed to switch to administrator account automatically. Please try logging in manually with credentials: admin@unimind.edu / admin123');
      }
    } catch (err: any) {
      setError('An error occurred during account switching.');
    } finally {
      setIsSwitching(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isAdmin) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        uploadFile(file);
      } else {
        showErrorToast('Only standard PDF files are supported for text indexing.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        uploadFile(file);
      } else {
        showErrorToast('Only standard PDF files are supported for text indexing.');
      }
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setUploadProgress(40);
      
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      setUploadProgress(85);
      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setSuccessMsg(`"${file.name}" processed, text extracted, and indexed for RAG queries successfully!`);
        fetchDocuments(); // Refresh list
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const detail = data.error ? ` Details: ${data.error}` : '';
        setError(`${data.message || 'Failed to complete document text extraction.'}${detail}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Connection failure during file upload and parsing stage.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDelete = async (docId: string, docTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${docTitle}" and remove its text snippets from the active AI knowledge base?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSuccessMsg(`Document "${docTitle}" removed successfully.`);
        setDocuments(prev => prev.filter(doc => doc._id !== docId));
      } else {
        setError(data.message || 'Failed to delete document from database.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to contact server to delete document.');
    }
  };

  const showErrorToast = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 5000);
  };

  // Helper to format bytes cleanly
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filtered document listing
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden p-6 sm:p-8 space-y-8" id="document-hub-panel">
      
      {/* Title & Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-600" />
            <span>RAG Document Hub & PDF Manager</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload PDF files to feed custom knowledge indices directly into UniMind AI for real-time Retrieval-Augmented Generation.
          </p>
        </div>
        
        {/* Active Indicators */}
        <div className="flex items-center gap-2 font-mono">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-slate-600 font-bold uppercase tracking-wide">
            RAG Engine: {documents.length > 0 ? 'Active & Sourced' : 'Standby (General Mode)'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-center gap-3"
            id="doc-hub-error-banner"
          >
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="flex-grow font-medium">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-3"
            id="doc-hub-success-banner"
          >
            <Check className="w-4 h-4 text-emerald-500 shrink-0 bg-emerald-100 p-0.5 rounded-full" />
            <div className="flex-grow font-medium">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN LEVEL PDF UPLOADER WORKSPACE */}
      {isAdmin ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-indigo-600 bg-indigo-50/50' 
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          id="pdf-upload-dropzone"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="application/pdf"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              {isUploading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                {isUploading ? 'Extracting text and parsing document...' : 'Drag & Drop university PDF here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isUploading ? 'Connecting OCR / parsing layout vectors' : 'or click to browse local files (max 10MB)'}
              </p>
            </div>

            {isUploading && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-2">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STUDENT READ-ONLY ALERT */
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="pdf-student-badge">
          <div className="flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Student Portal Read-Only View</p>
              <p className="text-slate-600 max-w-xl leading-relaxed">
                Only university administrators can upload or delete curriculum files and academic manuals. The active files listed below are fully parsed and searchable by the **UniMind AI Helpdesk** in your chats!
              </p>
            </div>
          </div>
          <button
            onClick={handleQuickSwitchToAdmin}
            disabled={isSwitching}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-100 cursor-pointer text-xs"
            id="btn-quick-switch-admin"
          >
            {isSwitching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Switch to Admin Mode</span>
          </button>
        </div>
      )}

      {/* FILTER SEARCH & DOCUMENT GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-500" />
            <span>Indexed Academic Source Files ({filteredDocs.length})</span>
          </h3>

          {/* Search box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search indexed manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
            />
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {isLoading ? (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Syncing official PDF documents list...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl space-y-3" id="doc-hub-empty">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-700">No matching manuals or guidelines found.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {documents.length === 0 
                  ? 'There are currently no active PDFs in the university knowledge base.' 
                  : 'Adjust your search query to find indexed matching PDF text indices.'}
              </p>
            </div>
          </div>
        ) : (
          /* DOCUMENT CARDS LIST */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="indexed-document-list">
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all flex flex-col justify-between gap-4 shadow-sm relative group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-grow">
                    <h4 className="font-bold text-xs text-slate-800 truncate" title={doc.title}>
                      {doc.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{doc.originalName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100/70 pt-3 text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </span>
                  <span className="font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {formatBytes(doc.size)}
                  </span>
                </div>

                {/* Hover Delete Action for admin */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(doc._id, doc.title)}
                    className="absolute top-3 right-3 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm border border-rose-100"
                    title="Permanently Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* RAG TUTORIAL EXPLANATORY SECTION */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-slate-800">Retriever is Syncing Instantly</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Whenever you upload official PDFs (deadlines, schedules, rules, catalogs), the AI instantly processes document text. Next time you converse in **AI Helpdesk**, the assistant will cite and answer using this verified literature.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
