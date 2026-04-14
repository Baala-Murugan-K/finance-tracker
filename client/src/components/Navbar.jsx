import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-green-400">💰 FinanceTracker</Link>
      {user && (
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-green-400">Dashboard</Link>
          <Link to="/transactions" className="hover:text-green-400">Transactions</Link>
          <Link to="/budget" className="hover:text-green-400">Budget</Link>
          <Link to="/goals" className="hover:text-green-400">Goals</Link>
          <span className="text-gray-400">Hi, {user.name}</span>
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;