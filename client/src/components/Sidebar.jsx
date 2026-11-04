import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Bell,
  History,
  Shield,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose, unreadNotificationsCount = 0 }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Knowledge Articles',
      path: '/articles',
      icon: BookOpen,
    },
    {
      name: 'Review Calendar',
      path: '/calendar',
      icon: Calendar,
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    {
      name: 'Activity Log',
      path: '/activity',
      icon: History,
    },
    ...(isAdmin
      ? [
          {
            name: 'Admin Panel',
            path: '/admin',
            icon: Shield,
          },
        ]
      : []),
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 h-screen flex-col justify-between border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 overflow-hidden ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand & Nav List */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          <div className="flex h-18 items-center justify-between border-b border-slate-100 px-6">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                  KNOWLEDGETRACK
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                </span>
                <span className="text-[10px] font-semibold text-slate-600 tracking-wider uppercase">
                  Governance Platform
                </span>
              </div>
            </NavLink>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 lg:hidden rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Slogan Banner */}
          <div className="mx-4 my-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
            <p className="text-[11px] font-medium text-slate-600 leading-snug">
              Keep Internal Knowledge Accurate, Current, and Review-Ready.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 py-2 overflow-y-auto">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4.5 w-4.5 transition-colors ${
                            isActive
                              ? 'text-indigo-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge ? (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-xs">
                            {item.badge}
                          </span>
                        ) : null}
                        {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-500" />}
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm ring-1 ring-indigo-500/20">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'KT'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900">{user?.name || 'User'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      user?.role === 'Admin'
                        ? 'bg-purple-100 text-purple-700'
                        : user?.role === 'Knowledge Owner'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {user?.role || 'Viewer'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
