import { Loader2 } from "lucide-react";
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { 
    isConnecting, 
    connectedWallet, 
    principal, 
    connectWallet, 
    logOut,
    walletOptions 
  } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 text-center border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Connect Your Wallet
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Choose your preferred wallet to connect to Consensus Sentry
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {connectedWallet ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Connected Wallet</p>
                  <p className="text-sm text-gray-600 mt-1">{connectedWallet}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Principal ID</p>
                  <p className="text-sm text-gray-600 mt-1 break-all">{principal}</p>
                </div>
                <button
                  onClick={logOut}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => connectWallet(wallet.id)}
                    disabled={isConnecting}
                    className="w-full flex items-center gap-3 py-2.5 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <span className="text-gray-700">
                        {wallet.icon}
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {wallet.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

