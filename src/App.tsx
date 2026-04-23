/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ApplicationForm from './pages/Application';
import PaymentPage from './pages/Payment';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { authService } from './services/dataService';
import { AuthProvider, useAuth } from './components/AuthProvider';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-600">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/apply" element={<PrivateRoute><ApplicationForm /></PrivateRoute>} />
              <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
            </Routes>
          </main>
          <Footer />
          <FloatingWhatsApp />
        </div>
      </Router>
    </AuthProvider>
  );
}
