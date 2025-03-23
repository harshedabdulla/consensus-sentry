import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { principal, connectedWallet, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Settings</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Principal ID:</span>
            <span className="font-medium text-gray-900">{principal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Connected Wallet:</span>
            <span className="font-medium text-gray-900">{connectedWallet || 'Not connected'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Wallet Management</h2>
        <p className="text-gray-600 mb-2">Manage your connected wallets and preferences.</p>
        <div className="space-y-4">
          <button className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-black transition-colors">
            Connect New Wallet
          </button>
          <button className="w-full border border-gray-600 px-4 py-2 rounded-md">
            Disconnect Wallet
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Settings;
