import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Shield,
  Calendar,
  Bell,
  Activity,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  FileCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { login, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (role) => {
    try {
      logout();
      if (role === 'Admin') {
        await login('admin@knowledgetrack.io', 'Admin@123');
      } else if (role === 'Owner') {
        await login('rahul.sharma@knowledgetrack.io', 'Owner@123');
      } else {
        await login('viewer@knowledgetrack.io', 'Viewer@123');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Quick login error:', err);
      navigate('/login');
    }
  };

  const featureCards = [
    {
      title: 'Knowledge Register',
      desc: 'Track every internal article, standard operating procedure, and runbook in one centralized registry.',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Explicit Ownership',
      desc: 'Eliminate orphaned docs. Every single article has a designated, accountable knowledge owner.',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      title: 'Dynamic Review Tracking',
      desc: 'Automated review calculations: Current (>30d), Due Soon (≤30d), and Overdue status with live countdowns.',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Smart Reminders & Alerts',
      desc: 'Proactive in-app notifications surface articles requiring review before outdated instructions trigger errors.',
      icon: Bell,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Knowledge Health Score',
      desc: 'Real-time percentage analytics demonstrating overall review-readiness across departments.',
      icon: Activity,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  const workflowSteps = [
    { num: '01', title: 'CREATE', desc: 'Author articles with intervals & tags' },
    { num: '02', title: 'ASSIGN OWNER', desc: 'Designate responsible domain owner' },
    { num: '03', title: 'REVIEW', desc: 'Perform periodic accuracy audit' },
    { num: '04', title: 'TRACK', desc: 'Automatic status recalculation' },
    { num: '05', title: 'UPDATE', desc: 'Maintain live audit history log' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/25">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white">
                KNOWLEDGETRACK
              </span>
              <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">
                Enterprise Knowledge Governance
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-102"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 shadow-inner mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Automatic Review Cadence & Expiry Engine
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Keep Your Knowledge Accurate.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-indigo-100 bg-clip-text text-transparent">
              Always.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Track internal knowledge articles, assign owners, monitor review schedules, and prevent outdated instructions from becoming operational risks.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-103"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              View Demo
            </Link>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 max-w-lg mx-auto">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Instant 1-Click Interactive Demo Login
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleQuickDemoLogin('Admin')}
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-colors"
              >
                ⚡ Explore as Admin
              </button>
              <button
                onClick={() => handleQuickDemoLogin('Owner')}
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-500/20 transition-colors"
              >
                ⚡ Explore as Owner
              </button>
              <button
                onClick={() => handleQuickDemoLogin('Viewer')}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                ⚡ Explore as Viewer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="relative bg-slate-950 py-20 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
              Complete Knowledge Governance
            </h2>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Engineered to eliminate stale documentation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xs transition-all hover:border-slate-700 hover:bg-slate-900"
                >
                  <div className={`inline-flex p-3 rounded-2xl border ${f.color} mb-5`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}

            {/* Dynamic Status Engine Feature Highlight */}
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-slate-900 p-6 sm:p-8">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automated Cadence Calculation</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                <code className="text-indigo-300 font-mono text-xs">Next Review = Last Date + Interval</code>. Articles continuously transition between Current, Due Soon, and Overdue without manual cron triggers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section className="py-20 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Standard Operating Rhythm
            </span>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              The 5-Step Knowledge Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-indigo-500/40">{step.num}</span>
                  <h4 className="mt-2 text-sm font-extrabold text-white tracking-wide">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">{step.desc}</p>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-600 font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 text-center text-xs text-slate-500">
        <p>© 2026 KnowledgeTrack. Keep Internal Knowledge Accurate, Current, and Review-Ready.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
