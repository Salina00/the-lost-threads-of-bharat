import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, KeyRound, Sparkles } from 'lucide-react';

const Auth = () => {
  const { login, register, error } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  
  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      if (!res.success) {
        setAuthError(res.error);
        setLoading(false);
      }
    } else {
      if (!name.trim()) {
        setAuthError('Name is required');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setAuthError(res.error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-maroon-dark p-6 relative overflow-hidden">
      
      {/* Heritage BG Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-royal-blue/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-gold bg-royal-blue-dark/50 text-gold mb-3 animate-pulse shadow-lg">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl text-gold font-display font-bold tracking-wide gold-text-glow">
            THE LOST THREADS OF BHARAT
          </h1>
          <p className="text-xs text-parchment-dark mt-1">Ancient Heritage • Fantasy Adventure</p>
        </div>

        {/* Card */}
        <div className="heritage-card p-8 rounded-lg border gold-border">
          <h2 className="text-xl text-gold font-display mb-6 text-center">
            {isLogin ? 'Log In' : 'Sign Up'}
          </h2>

          {(authError || error) && (
            <div className="bg-red-950/60 border border-red-500 text-red-200 p-3 rounded text-xs mb-6 font-medium text-center">
              {authError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-parchment-dark font-display font-medium">User Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-parchment-dark" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-royal-blue-dark border border-royal-blue-light rounded pl-10 pr-4 py-2.5 text-sm text-parchment outline-none focus:border-gold"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-parchment-dark font-display font-medium">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-parchment-dark" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@heritage.com"
                  className="w-full bg-royal-blue-dark border border-royal-blue-light rounded pl-10 pr-4 py-2.5 text-sm text-parchment outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-parchment-dark font-display font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-parchment-dark" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-royal-blue-dark border border-royal-blue-light rounded pl-10 pr-4 py-2.5 text-sm text-parchment outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-heritage py-2.5 text-sm mt-4 w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <KeyRound size={16} />
              {loading ? 'Logging in...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>

          </form>

          {/* Toggle */}
          <div className="text-center mt-6 pt-4 border-t border-royal-blue-light text-xs">
            <span className="text-parchment-dark mr-1.5">
              {isLogin ? 'New to the game?' : 'Already have an account?'}
            </span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError('');
              }}
              className="text-gold font-display font-bold hover:underline"
            >
              {isLogin ? 'Create Account' : 'Login'}
            </button>
          </div>

        </div>

        {/* Small theme footnote */}
        <p className="text-[10px] text-center text-parchment-dark mt-6 italic">
          "The thread of truth never snaps, it only hides."
        </p>

      </div>
    </div>
  );
};

export default Auth;
