import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Shield, ArrowRight } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect admin mode from route path (/admin/login) or query string (?role=admin)
  const isDirectAdminPath = location.pathname === '/admin/login' || new URLSearchParams(location.search).get('role') === 'admin';
  const [isAdminMode, setIsAdminMode] = useState(isDirectAdminPath);

  useSEO({
    title: isDirectAdminPath ? 'Administrator Login' : 'Log In',
    description: 'Log in to Capacity Connect to access your trainee, trainer, or admin dashboard.',
    path: location.pathname,
  });

  React.useEffect(() => {
    setIsAdminMode(location.pathname === '/admin/login' || new URLSearchParams(location.search).get('role') === 'admin');
  }, [location.pathname, location.search]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'trainee') navigate('/trainee/dashboard');
      else if (user.role === 'trainer') navigate('/trainer/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      if (isAdminMode && loggedUser.role !== 'admin') {
        logout();
        setError('Access denied: This account does not possess administrator privileges.');
        return;
      }
      // Auth context sets the user, useEffect above handles redirect
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <Link to="/" className="absolute top-8 left-8 text-xl font-bold text-violet-400 hover:text-violet-300 transition-colors">
        CC<span className="text-cyan-400">.</span>
      </Link>
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        {/* Role Access Selector */}
        <div className="flex rounded-lg bg-slate-950 p-1 mb-6 border border-slate-800" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isAdminMode}
            onClick={() => {
              setIsAdminMode(false);
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              !isAdminMode
                ? 'bg-slate-800 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trainee / Trainer
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isAdminMode}
            onClick={() => {
              setIsAdminMode(true);
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              isAdminMode
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield size={13} className="text-violet-400" />
            Admin Login
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            {isAdminMode ? 'Administrator Sign In' : 'Welcome back'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isAdminMode
              ? 'Access the Capacity Connect administrative console'
              : 'Log in to your Capacity Connect account'}
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm text-center" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={isAdminMode ? 'admin@capacityconnect.com' : 'you@example.com'}
            autoComplete="email"
          />
          <Input 
            label="Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="pt-2">
            <Button type="submit" fullWidth isLoading={loading}>
              {isAdminMode ? 'Sign In as Administrator' : 'Sign In'}
            </Button>
          </div>
        </form>
        
        {!isAdminMode ? (
          <>
            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors">
                Sign up
              </Link>
            </p>
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(true);
                  setError('');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition-colors"
              >
                <Shield size={13} className="text-slate-500" />
                <span>Need administrator access? Admin Login</span>
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Admin privileges are restricted and monitored.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                setError('');
              }}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
            >
              <span>Return to standard user login</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
