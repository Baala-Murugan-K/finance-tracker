import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl">💰</span>
        <span className="text-xl font-bold text-green-500">FinanceTracker</span>
      </Link>

      {user && (
        <div className="flex gap-4 items-center">
          {[
            { to: '/', label: 'Dashboard' },
            { to: '/transactions', label: 'Transactions' },
            { to: '/budget', label: 'Budget' },
            { to: '/goals', label: 'Goals' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 transition"
            >
              {link.label}
            </Link>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-lg"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <Link
            to="/profile"
            className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm hover:bg-green-600 transition"
          >
            {user.name?.charAt(0).toUpperCase()}
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;