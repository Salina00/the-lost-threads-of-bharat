import React, { useContext, useState, lazy, Suspense } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import IntroVideo from './components/IntroVideo';
import './App.css';

const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);
  const [introFinished, setIntroFinished] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-maroon-dark text-gold font-display gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">Consulting the Sutradhar...</p>
      </div>
    );
  }

  if (user && !introFinished) {
    return <IntroVideo onFinished={() => setIntroFinished(true)} />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-maroon-dark text-gold font-display gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin"></div>
        <p className="text-xs uppercase tracking-widest animate-pulse">Loading scrolls...</p>
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
