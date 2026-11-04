import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, Clock, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            KNOWLEDGETRACK
          </span>
        </Link>
        <p className="mt-2 text-xs font-semibold text-indigo-300 tracking-wide uppercase">
          Keep Internal Knowledge Accurate, Current, and Review-Ready
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="rounded-3xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-100">
          <Outlet />
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Role-Based Access
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            Automated Recalculation
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
