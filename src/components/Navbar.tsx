import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Plane, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../services/dataService';
import { cn } from '../lib/utils';

import { useAuth } from './AuthProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/#services' },
    { name: 'Apply Now', path: '/apply' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Contact', path: '/#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-blue-600 rotate-45" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TravelWave
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <User className="h-4 w-4" /> {user.fullName.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-600 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block text-base font-medium text-gray-700 hover:text-blue-600"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">{user.fullName}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-blue-600 text-white px-5 py-3 rounded-xl font-medium"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
