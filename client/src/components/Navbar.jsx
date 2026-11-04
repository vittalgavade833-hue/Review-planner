import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Check,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import { formatRelativeTime } from '../utils/dateUtils';

const Navbar = ({ onToggleSidebar, notifications = [], onNotificationUpdated }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/articles?search=${encodeURIComponent(searchTerm.trim())}`);
    } else if (location.pathname === '/articles') {
      navigate('/articles');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      if (onNotificationUpdated) onNotificationUpdated();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      if (onNotificationUpdated) onNotificationUpdated();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md lg:px-8">
      {/* Left side: Hamburger on mobile + Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search knowledge articles, categories, owners, tags..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 transition-all"
          />
        </form>
      </div>

      {/* Right side: Notifications Popover + User Profile Quick View */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-slate-400">No notifications at this moment.</p>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => {
                    return (
                      <div
                        key={notif._id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (notif.article) {
                            const artId = notif.article._id || notif.article;
                            navigate(`/articles/${artId}`);
                          } else {
                            navigate('/notifications');
                          }
                        }}
                        className={`group relative flex cursor-pointer items-start gap-3 p-3 transition-colors rounded-xl ${
                          !notif.read ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.type === 'warning' ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                              <AlertTriangle className="h-4 w-4" />
                            </span>
                          ) : notif.type === 'reminder' ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                              <Clock className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-snug">
                            {notif.message}
                          </p>
                          <span className="mt-1 block text-[10px] text-slate-400 font-medium">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                            title="Mark as read"
                            className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-white transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center gap-1 w-full py-1"
                >
                  View all reminders & notifications
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Pill with Interactive Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer rounded-xl p-1 hover:bg-slate-50 transition-colors"
            title="User Profile Menu"
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{user?.name}</span>
              <span className="text-[10px] font-semibold text-slate-600">{user?.role}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs hover:scale-105 transition-transform">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()
                : 'KT'}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="border-b border-slate-100 p-2.5">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {user?.role}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {user?.department || 'Operations'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Account Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
