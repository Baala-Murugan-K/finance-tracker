import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Profile = () => {
  const { user, login } = useAuth();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [nameMsg, setNameMsg] = useState({ text: '', type: '' });
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setNameLoading(true);
    setNameMsg({ text: '', type: '' });
    try {
      const res = await axios.put('/auth/profile', { name: nameForm.name });
      const token = localStorage.getItem('token');
      login({ ...res.data, token });
      setNameMsg({ text: 'Name updated successfully!', type: 'success' });
    } catch (err) {
      setNameMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });
    if (passForm.newPassword !== passForm.confirmPassword) {
      return setPassMsg({ text: 'New passwords do not match', type: 'error' });
    }
    if (passForm.newPassword.length < 6) {
      return setPassMsg({ text: 'Password must be at least 6 characters', type: 'error' });
    }
    setPassLoading(true);
    try {
      await axios.put('/auth/profile', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassMsg({ text: 'Password changed successfully!', type: 'success' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-green-100 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Update Name */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">✏️ Update Name</h3>

          {nameMsg.text && (
            <div className={`px-4 py-3 rounded-xl mb-4 text-sm ${
              nameMsg.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {nameMsg.text}
            </div>
          )}

          <form onSubmit={handleNameUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={nameForm.name}
                onChange={e => setNameForm({ name: e.target.value })}
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 rounded-xl px-4 py-3 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={nameLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
            >
              {nameLoading ? 'Updating...' : 'Update Name'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">🔐 Change Password</h3>

          {passMsg.text && (
            <div className={`px-4 py-3 rounded-xl mb-4 text-sm ${
              passMsg.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirmPassword' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                <input
                  type="password"
                  value={passForm[field.key]}
                  onChange={e => setPassForm({ ...passForm, [field.key]: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={passLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition"
            >
              {passLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;