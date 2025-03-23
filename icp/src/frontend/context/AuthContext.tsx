import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { Artemis } from 'artemis-web3-adapter'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  artemisAdapter: InstanceType<typeof Artemis> | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connectedWallet: string | null
  principal: string | null
  logOut: () => void
  connectWallet: (walletName: string) => Promise<void>
  walletOptions: WalletOption[]
}

interface AuthProviderProps {
  children: ReactNode
}

interface WalletOption {
  name: string;
  icon: string;
  id: string;
}

const walletOptions: WalletOption[] = [
  {
    name: 'Internet Identity',
    icon: '🌐',
    id: 'internet-identity'
  },
  {
    name: 'Plug',
    icon: '🔌',
    id: 'plug'
  },
  {
    name: 'Stoic',
    icon: '⚡',
    id: 'stoic'
  },
  {
    name: 'AstroX ME',
    icon: '⭐',
    id: 'astrox'
  },
  {
    name: 'Infinity Wallet',
    icon: '♾️',
    id: 'infinity'
  },
  {
    name: 'NFID',
    icon: '🔑',
    id: 'nfid'
  },
  {
    name: 'MetaMask (MSQ)',
    icon: '🦊',
    id: 'msq'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate()
  const [artemisAdapter, setArtemisAdapter] = useState<InstanceType<typeof Artemis> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(() => 
    sessionStorage.getItem('connectedWallet')
  )
  const [principal, setPrincipal] = useState<string | null>(() => 
    sessionStorage.getItem('principal')
  )

  const connectWallet = async (walletName: string) => {
    setIsConnecting(true)
    setError(null)
    try {
      console.log('Starting wallet connection process for:', walletName)
      
      // Create new adapter instance
      const adapter = new Artemis({
        whitelist: ['rrkah-fqaaa-aaaaa-aaaaq-cai'],
        host: 'https://ic0.app'
      });

      console.log('Adapter created:', adapter);

      // Connect to wallet
      await adapter.connect(walletName);
      console.log('Connected to wallet');

      // Get principal from the adapter
      const principalId = adapter.principalId;
      console.log('Got principal:', principalId);

      // Store in session storage
      sessionStorage.setItem('connectedWallet', walletName);
      sessionStorage.setItem('principal', principalId);
      
      // Update state
      setArtemisAdapter(adapter)
      setIsConnected(true)
      setConnectedWallet(walletName)
      setPrincipal(principalId)
      localStorage.setItem('isAuthenticated', 'true')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error connecting Artemis wallet:', error)
      setError('Failed to connect to the wallet. Please try again.')
      setIsConnected(false)
      setConnectedWallet(null)
      setPrincipal(null)
    } finally {
      setIsConnecting(false)
    }
  }

  const logOut = () => {
    // Clear session storage
    sessionStorage.removeItem('connectedWallet')
    sessionStorage.removeItem('principal')
    
    // Reset state
    setArtemisAdapter(null)
    setIsConnected(false)
    setConnectedWallet(null)
    setPrincipal(null)
    localStorage.removeItem('isAuthenticated')
    navigate('/login')
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (artemisAdapter) {
        console.log('Disconnecting wallet:', artemisAdapter.walletActive)
        artemisAdapter.disconnect()
      }
    }
  }, [artemisAdapter])

  return (
    <AuthContext.Provider
      value={{
        artemisAdapter,
        isConnected,
        isConnecting,
        error,
        connectedWallet,
        principal,
        logOut,
        connectWallet,
        walletOptions
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext