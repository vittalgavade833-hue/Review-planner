import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 mb-6 ring-1 ring-indigo-500/20">
        <BookOpen className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">404</h1>
      <p className="mt-2 text-base font-bold text-slate-700">Page or Article Not Found</p>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The knowledge register link you requested may have been moved or removed.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Knowledge Articles
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
