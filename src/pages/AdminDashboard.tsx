import { useEffect, useState } from 'react';
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
      const [appsRes, paymentsRes] = await Promise.all([
        dataService.getApplications(),
        dataService.getPayments()
      ]);
      setApps(appsRes);
      setPayments(paymentsRes);
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  const updateStatus = async (id: string, status: Application['status']) => {
    await dataService.updateApplicationStatus(id, status);
    const updated = await dataService.getApplications();
    setApps(updated);
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

        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-widest text-[10px] font-black text-gray-400">
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
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                          {app.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{app.fullName}</p>
                          <p className="text-xs text-gray-400">#{app.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-gray-700">{app.purpose}</p>
                      <p className="text-xs text-gray-500 italic">{app.destination}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        app.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        app.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        app.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-xs font-bold text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {payments.find(p => p.applicationId === app.id) && (
                          <button 
                            onClick={() => setSelectedReceipt(payments.find(p => p.applicationId === app.id)!.receiptUrl)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Receipt"
                          >
                            <ImageIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => updateStatus(app.id, 'processing')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Set Processing"
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
