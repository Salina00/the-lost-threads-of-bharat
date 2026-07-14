import React, { useContext, lazy, Suspense, useEffect } from 'react';
import { AuthProvider, AuthContext, API_URL } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './App.css';

const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

  // Keep-alive ping to prevent Render server spin-down (inactivity timeout)
  useEffect(() => {
    const pingServer = async () => {
      try {
        const baseUrl = API_URL.replace('/api', '');
        await fetch(baseUrl);
        console.log('Keep-alive ping sent to Render backend');
      } catch (err) {
        console.error('Keep-alive ping failed:', err);
      }
    };

    pingServer();
    const interval = setInterval(pingServer, 50000); // 50 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-maroon-dark text-gold font-display gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-maroon-dark text-gold font-display gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    }>
      {user ? <Dashboard /> : <Auth />}
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
