import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center transition-colors duration-300">
      <span className="text-6xl mb-4 animate-bounce">💰</span>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">FinanceTracker</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Take control of your money</p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      <p className="text-gray-400 text-sm mt-3">Loading your data...</p>
    </div>
  );

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;