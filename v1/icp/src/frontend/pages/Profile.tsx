import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { principal, connectedWallet, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logOut();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Profile</h1>

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
        <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
        <p className="text-gray-600 mb-2">Your wallet is connected to the Consensus Sentry platform.</p>
        <p className="text-gray-600">Ensure that you keep your wallet secure and do not share your private keys.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ul className="space-y-2">
          <li className="flex justify-between p-2 border-b border-gray-200">
            <span className="text-gray-800">Created a new guardrail proposal</span>
            <span className="text-gray-600">2 days ago</span>
          </li>
          <li className="flex justify-between p-2 border-b border-gray-200">
            <span className="text-gray-800">Voted on proposal #42</span>
            <span className="text-gray-600">3 days ago</span>
          </li>
          <li className="flex justify-between p-2 border-b border-gray-200">
            <span className="text-gray-800">Updated profile information</span>
            <span className="text-gray-600">1 week ago</span>
          </li>
        </ul>
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

export default Profile;
