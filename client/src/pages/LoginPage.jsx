import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to access your knowledge articles and reviews
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In to KnowledgeTrack
            </>
          )}
        </button>
      </form>

      {/* 1-Click Demo Fill Box */}
      <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Demo Logins (Click to autofill):</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => fillCredentials('admin@knowledgetrack.io', 'Admin@123')}
            className="rounded-lg border border-purple-200 bg-purple-50 px-2 py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition-colors text-center"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('rahul.sharma@knowledgetrack.io', 'Owner@123')}
            className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition-colors text-center"
          >
            Owner
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('viewer@knowledgetrack.io', 'Viewer@123')}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors text-center"
          >
            Viewer
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
          Create one now
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
