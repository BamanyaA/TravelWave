import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Package, Clock, Eye, Check, XCircle, Search, Filter, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { dataService, authService } from '../services/dataService';
import { useAuth } from '../components/AuthProvider';
import { Application, Payment } from '../types';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        setError(null);
        const [appsRes, paymentsRes] = await Promise.all([
          dataService.getApplications(),
          dataService.getPayments()
        ]);
        setApps(appsRes || []);
        setPayments(paymentsRes || []);
      } catch (err: any) {
        console.error("Dashboard data fetch failed:", err);
        setError("Failed to load dashboard data. Please check your permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const updateStatus = async (id: string, status: Application['status']) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await dataService.updateApplicationStatus(id, status);
      const updated = await dataService.getApplications();
      setApps(updated);
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredApps = apps.filter(a => 
    a.fullName.toLowerCase().includes(search.toLowerCase()) || 
    a.destination.toLowerCase().includes(search.toLowerCase()) ||
    a.id.includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
              <p className="text-gray-500 italic">Manage all global travel applications</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by name, ID or destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Filter className="h-5 w-5" /> Filter
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center font-bold">
            {error}
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-widest text-[10px] font-black text-gray-400">
                  <th className="px-8 py-6 text-center">Receipt</th>
                  <th className="px-8 py-6">Applicant</th>
                  <th className="px-6 py-6">Service & Destination</th>
                  <th className="px-6 py-6">Status</th>
                  <th className="px-6 py-6">Date</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        {payments.find(p => p.applicationId === app.id) ? (
                          <button 
                            onClick={() => setSelectedReceipt(payments.find(p => p.applicationId === app.id)!.receiptUrl)}
                            className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all shadow-sm"
                            title="View Receipt"
                          >
                            <ImageIcon className="h-6 w-6" />
                          </button>
                        ) : (
                          <div className="p-3 text-gray-300 bg-gray-50 rounded-2xl cursor-not-allowed">
                            <ImageIcon className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                          {app.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{app.fullName}</p>
                          <p className="text-xs text-gray-400 font-mono">#{app.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-gray-700">{app.purpose}</p>
                      <p className="text-xs text-gray-500 italic">{app.destination}</p>
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ActionButton 
                          onClick={() => updateStatus(app.id, 'processing')}
                          icon={<Clock className="h-4 w-4" />}
                          color="blue"
                          label="Processing"
                          loading={actionLoading[app.id]}
                          active={app.status === 'processing'}
                        />
                        <ActionButton 
                          onClick={() => updateStatus(app.id, 'approved')}
                          icon={<Check className="h-4 w-4" />}
                          color="green"
                          label="Approve"
                          loading={actionLoading[app.id]}
                          active={app.status === 'approved'}
                        />
                        <ActionButton 
                          onClick={() => updateStatus(app.id, 'rejected')}
                          icon={<XCircle className="h-4 w-4" />}
                          color="red"
                          label="Reject"
                          loading={actionLoading[app.id]}
                          active={app.status === 'rejected'}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden grid grid-cols-1 gap-6 p-6">
            {filteredApps.map((app) => (
              <div key={app.id} className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl">
                      {app.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{app.fullName}</h3>
                      <p className="text-xs text-gray-400 font-mono italic">#{app.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Purpose</p>
                    <p className="text-sm font-bold text-gray-700">{app.purpose}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Destination</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{app.destination}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 w-full">
                    {payments.find(p => p.applicationId === app.id) && (
                      <button 
                         onClick={() => setSelectedReceipt(payments.find(p => p.applicationId === app.id)!.receiptUrl)}
                         className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold transition-all hover:bg-indigo-100"
                      >
                        <ImageIcon className="h-5 w-5" />
                        <span>View Proof</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => updateStatus(app.id, 'processing')}
                      disabled={actionLoading[app.id]}
                      className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${
                        app.status === 'processing' 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'
                      }`}
                    >
                      <Clock className={`h-6 w-6 mb-1 ${actionLoading[app.id] ? 'animate-spin' : ''}`} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Process</span>
                    </button>
                    <button 
                      onClick={() => updateStatus(app.id, 'approved')}
                      disabled={actionLoading[app.id]}
                      className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${
                        app.status === 'approved' 
                        ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-100' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-500'
                      }`}
                    >
                      <Check className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Approve</span>
                    </button>
                    <button 
                      onClick={() => updateStatus(app.id, 'rejected')}
                      disabled={actionLoading[app.id]}
                      className={`flex flex-col items-center justify-center py-4 rounded-2xl border transition-all ${
                        app.status === 'rejected' 
                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-100' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-red-200 hover:text-red-500'
                      }`}
                    >
                      <XCircle className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredApps.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 italic">No applications matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] max-w-4xl w-full p-8 relative overflow-hidden"
          >
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
            >
              <XCircle className="h-6 w-6 text-gray-500" />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Payment Receipt</h3>
              <p className="text-gray-500 text-sm">Verified Transaction Proof</p>
            </div>

            <div className="aspect-[4/3] w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
              <img 
                src={selectedReceipt} 
                className="max-h-full max-w-full object-contain" 
                alt="Receipt Detail"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://placehold.co/600x400?text=Receipt+Link+Expired"
                }}
              />
            </div>
            
            <div className="mt-8 flex justify-center">
              <a 
                href={selectedReceipt} 
                target="_blank" 
                rel="no-referrer"
                className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                <ExternalLink className="h-5 w-5" /> Open in New Tab
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Application['status'] }) {
  const styles = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    processing: 'bg-blue-50 text-blue-600 border-blue-100',
    approved: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-red-50 text-red-600 border-red-100'
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}

function ActionButton({ 
  onClick, 
  icon, 
  color, 
  label, 
  loading, 
  active 
}: { 
  onClick: () => void, 
  icon: React.ReactNode, 
  color: 'blue' | 'green' | 'red' | 'indigo',
  label: string,
  loading?: boolean,
  active?: boolean
}) {
  const colors = {
    blue: active ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100',
    green: active ? 'bg-green-600 text-white border-green-600 shadow-md' : 'text-green-600 bg-green-50 hover:bg-green-100 border-green-100',
    red: active ? 'bg-red-600 text-white border-red-600 shadow-md' : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-100',
    indigo: active ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
  };

  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={`relative group p-2.5 rounded-xl border transition-all flex items-center justify-center ${colors[color]} disabled:opacity-50`}
      title={label}
    >
      {loading ? <Clock className="h-4 w-4 animate-spin" /> : icon}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </button>
  );
}
