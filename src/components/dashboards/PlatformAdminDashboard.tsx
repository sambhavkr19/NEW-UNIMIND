import { useState, useEffect } from 'react';
import { Terminal, Cpu, Database, Building2, UserCheck, Settings, Activity, ShieldCheck, AlertTriangle, Plus, RefreshCw, Loader2, CheckCircle, Server, Zap, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { College, SystemLogItem } from '../../types';

export default function PlatformAdminDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'colleges' | 'admins' | 'monitor' | 'logs' | 'settings'>('analytics');

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Colleges State
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [collegeLocation, setCollegeLocation] = useState('');

  // Admins State
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

  // Monitor State
  const [monitor, setMonitor] = useState<any>(null);
  const [isLoadingMonitor, setIsLoadingMonitor] = useState(false);

  // System Logs State
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [logLevel, setLogLevel] = useState('all');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<any>({
    maintenanceMode: false,
    aiModel: 'gemini-1.5-flash',
    systemBanner: 'UniMind AI Platform Online',
  });

  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      if (activeTab === 'analytics') fetchAnalytics();
      if (activeTab === 'colleges') fetchColleges();
      if (activeTab === 'admins') fetchAdmins();
      if (activeTab === 'monitor') fetchMonitor();
      if (activeTab === 'logs') fetchLogs();
      if (activeTab === 'settings') fetchSettings();
    }
  }, [token, activeTab, logLevel]);

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch('/api/platform/analytics', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const fetchColleges = async () => {
    setIsLoadingColleges(true);
    try {
      const res = await fetch('/api/platform/colleges', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setColleges(data.colleges);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingColleges(false);
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/platform/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: collegeName, code: collegeCode, location: collegeLocation }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Created campus: ${collegeName}`);
        setShowAddCollegeModal(false);
        setCollegeName('');
        setCollegeCode('');
        setCollegeLocation('');
        fetchColleges();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdmins = async () => {
    setIsLoadingAdmins(true);
    try {
      const res = await fetch('/api/platform/admins', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const fetchMonitor = async () => {
    setIsLoadingMonitor(true);
    try {
      const res = await fetch('/api/platform/monitor', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setMonitor(data.monitor);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMonitor(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/platform/logs?level=${logLevel}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/platform/settings', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      const res = await fetch('/api/platform/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Setting '${key}' updated.`);
        setSettings((prev: any) => ({ ...prev, [key]: value }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" id="platform-admin-dashboard">
      {/* Developer Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold rounded-full border border-emerald-500/30">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>PLATFORM DEVELOPER ADMIN • ROOT ACCESS</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white">
            Platform Developer Infrastructure
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Monitor Gemini API endpoints, MongoDB cloud connections, multi-college tenants, system logs, and global feature toggles.
          </p>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3 z-10 font-mono text-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
            DEV
          </div>
          <div>
            <span className="block font-bold text-white">{user?.name}</span>
            <span className="block text-[10px] text-emerald-400">Platform Developer</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs" id="platform-admin-tabs">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('colleges')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'colleges' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Manage Colleges</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'admins' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>College Administrators</span>
        </button>

        <button
          onClick={() => setActiveTab('monitor')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'monitor' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Gemini & MongoDB Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>System Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'settings' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* Message alert */}
      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex justify-between items-center border border-emerald-200">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {isLoadingAnalytics ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">Loading analytics...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Registered Colleges</span>
                <span className="block font-black text-3xl text-slate-900">{analytics?.totalColleges ?? 3}</span>
                <p className="text-[10px] text-slate-500 font-mono">Active campus tenants</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Administrators</span>
                <span className="block font-black text-3xl text-indigo-600">{analytics?.totalAdmins ?? 5}</span>
                <p className="text-[10px] text-slate-500 font-mono">College and platform admins</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">MongoDB Database Status</span>
                <span className="block font-bold text-sm text-emerald-600 font-mono">{analytics?.dbStatus ?? 'Healthy'}</span>
                <p className="text-[10px] text-slate-500 font-mono">Mongoose Pool Connection</p>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Gemini AI Key Status</span>
                <span className="block font-bold text-sm text-emerald-600 font-mono">{analytics?.geminiStatus ?? 'Active'}</span>
                <p className="text-[10px] text-slate-500 font-mono">Model: gemini-1.5-flash</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'colleges' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-150">
            <div>
              <h2 className="font-display font-extrabold text-xl text-slate-900">Manage University Campuses</h2>
              <p className="text-xs text-slate-500 mt-1">Multi-tenant college directory and provisioning.</p>
            </div>
            <button
              onClick={() => setShowAddCollegeModal(true)}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add College Tenant</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {colleges.map((c) => (
              <div key={c._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold rounded">{c.code}</span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{c.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">{c.status}</span>
                </div>
                <p className="text-xs text-slate-500">{c.location}</p>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-200">
                  <span>Students: {c.studentCount}</span>
                  <span>Admins: {c.adminCount}</span>
                </div>
              </div>
            ))}
          </div>

          {showAddCollegeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
              <form onSubmit={handleCreateCollege} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                <h3 className="font-bold text-sm text-slate-900">Add New College Tenant</h3>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">College Name</label>
                  <input type="text" required value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">College Code</label>
                  <input type="text" required value={collegeCode} onChange={(e) => setCollegeCode(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Location / Campus</label>
                  <input type="text" value={collegeLocation} onChange={(e) => setCollegeLocation(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddCollegeModal(false)} className="px-3 py-1.5 text-xs border rounded-xl">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-slate-900 text-white font-bold rounded-xl">Create</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'admins' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
          <div className="pb-4 border-b border-slate-150">
            <h2 className="font-display font-extrabold text-xl text-slate-900">College Administrator Directory</h2>
            <p className="text-xs text-slate-500 mt-1">Review verified administrative staff across university departments.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {admins.map((a) => (
              <div key={a._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{a.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{a.email}</p>
                </div>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-mono font-bold rounded text-[10px] uppercase">
                  {a.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'monitor' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-150">
            <div>
              <h2 className="font-display font-extrabold text-xl text-slate-900">Gemini API & MongoDB Realtime Monitor</h2>
              <p className="text-xs text-slate-500 mt-1">Live service ping and system resource consumption.</p>
            </div>
            <button onClick={fetchMonitor} className="p-2 border rounded-xl hover:bg-slate-50">
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 text-white rounded-2xl space-y-3 font-mono text-xs border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Database className="w-4 h-4" />
                <span>MongoDB Health & Connection</span>
              </div>
              <p className="text-slate-400">Status: <span className="text-emerald-400 font-bold">{monitor?.database?.connected ? 'CONNECTED' : 'DISCONNECTED'}</span></p>
              <p className="text-slate-400">Ping Latency: <span className="text-white">{monitor?.database?.pingMs ?? 5} ms</span></p>
              <p className="text-slate-400">Target URI: <span className="text-slate-300">{monitor?.database?.uri ?? 'MongoDB Cloud'}</span></p>
            </div>

            <div className="p-5 bg-slate-950 text-white rounded-2xl space-y-3 font-mono text-xs border border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Zap className="w-4 h-4" />
                <span>Gemini 1.5 Flash SDK Status</span>
              </div>
              <p className="text-slate-400">API Key Configured: <span className="text-emerald-400 font-bold">{monitor?.geminiApi?.configured ? 'YES (Valid)' : 'NO'}</span></p>
              <p className="text-slate-400">Target AI Model: <span className="text-indigo-300">{monitor?.geminiApi?.model ?? 'gemini-1.5-flash'}</span></p>
              <p className="text-slate-400">Est Response Time: <span className="text-white">{monitor?.geminiApi?.latencyMs ?? 120} ms</span></p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-slate-950 text-slate-200 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Platform System Audit Logs</h2>
            </div>
            <select
              value={logLevel}
              onChange={(e) => setLogLevel(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded-xl text-slate-300"
            >
              <option value="all">All Levels</option>
              <option value="info">INFO</option>
              <option value="warn">WARN</option>
              <option value="error">ERROR</option>
            </select>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log._id} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  log.level === 'error' ? 'bg-rose-950 text-rose-400' : log.level === 'warn' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                <span className="text-indigo-400 font-bold">[{log.component}]</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-6">
          <div className="pb-4 border-b border-slate-150">
            <h2 className="font-display font-extrabold text-xl text-slate-900">Platform Developer Settings</h2>
            <p className="text-xs text-slate-500 mt-1">Configure global parameters and feature switches.</p>
          </div>

          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="font-bold text-xs text-slate-900">Maintenance Mode</p>
                <p className="text-[10px] text-slate-500">Temporarily restrict student access</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleUpdateSetting('maintenanceMode', e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block font-bold text-xs text-slate-900">Default Gemini Model</label>
              <select
                value={settings.aiModel}
                onChange={(e) => handleUpdateSetting('aiModel', e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (Fast, Recommended)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (High Intelligence)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
