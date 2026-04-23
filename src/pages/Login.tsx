import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { authService } from '../services/dataService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500 italic">Login to track your travel applications</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm italic">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-2xl transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-500 italic">Don't have an account? </span>
            <Link to="/signup" className="text-blue-600 font-bold hover:underline">
              Create Account
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">Demo Admin Credentials</p>
            <p className="text-xs text-center text-gray-500 mt-2">
              Email: <span className="font-mono bg-gray-50 px-1">admin@travelwave.com</span><br/>
              Pass: <span className="font-mono bg-gray-50 px-1">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
