import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Package, Clock, ShieldCheck, AlertCircle, ChevronRight, Plane, ArrowRight } from 'lucide-react';
import { dataService, authService } from '../services/dataService';
import { useAuth } from '../components/AuthProvider';
import { Application, User } from '../types';
import { Link } from 'react-router-dom';

const statusMap = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  approved: { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  rejected: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function UserDashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      dataService.getApplications(user.uid).then(res => {
        setApps(res);
        setLoading(false);
      });
    }
  }, [user]);

  if (!user) return <div className="pt-32 text-center h-screen">Please login access your dashboard.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, <span className="text-blue-600">{user.fullName.split(' ')[0]}!</span></h1>
            <p className="text-gray-500 italic">Manage and track your travel applications here.</p>
          </div>
          <Link 
            to="/apply" 
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
          >
            New Application <Plane className="h-5 w-5" />
          </Link>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />)}
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
            <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto italic">Start your journey today! Submit your first travel or document application.</p>
            <Link to="/apply" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1">Start New Application</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {apps.map((app, index) => {
              const status = statusMap[app.status];
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className={`h-16 w-16 ${status.bg} ${status.color} rounded-2xl flex items-center justify-center shrink-0`}>
                    <status.icon className="h-8 w-8" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">App ID: #{app.id.slice(-6).toUpperCase()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color} border ${status.border}`}>
                        {app.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{app.purpose} to {app.destination}</h3>
                    <p className="text-sm text-gray-500 italic mt-1">Submitted on {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-tighter">Last Update</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(app.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Dashboard Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { label: 'Pending', value: apps.filter(a => a.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Processing', value: apps.filter(a => a.status === 'processing').length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Approved', value: apps.filter(a => a.status === 'approved').length, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
              <span className="text-gray-500 font-bold italic">{stat.label}</span>
              <span className={`text-4xl font-black ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
