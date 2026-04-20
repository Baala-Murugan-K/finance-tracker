import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/transactions', label: 'Transactions' },
    { to: '/budget', label: 'Budget' },
    { to: '/goals', label: 'Goals' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-lg font-bold text-green-500">FinanceTracker</span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="hidden md:flex gap-4 items-center">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition">
                {link.label}
              </Link>
            ))}
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-lg">
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/profile"
              className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm hover:bg-green-600 transition">
              {user.name?.charAt(0).toUpperCase()}
            </Link>
            <button onClick={handleLogout}
              className="text-sm font-medium text-red-500 hover:text-red-600 transition">
              Logout
            </button>
          </div>
        )}

        {/* Mobile Right */}
        {user && (
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-base">
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 flex flex-col justify-center items-center gap-1.5">
              <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {user && menuOpen && (
        <div className="md:hidden mt-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-green-500 transition">
              {link.label}
            </Link>
          ))}
          <Link to="/profile"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            👤 Profile
          </Link>
          <button onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;