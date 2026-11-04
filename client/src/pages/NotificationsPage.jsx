import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Check,
  CheckCheck,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { formatRelativeTime, formatDate } from '../utils/dateUtils';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const { showToast, refreshNotifications } = useOutletContext();
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read.');
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadTotal = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Notifications & Alerts
            </h1>
            {unreadTotal > 0 && (
              <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                {unreadTotal} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time cadence reminders, overdue alerts, and article review verifications.
          </p>
        </div>

        {unreadTotal > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-indigo-600" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadTotal})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">
            {filter === 'unread' ? 'Zero unread notifications' : 'No notifications yet'}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            You will be alerted whenever an article assigned to you is due soon or overdue for review.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => {
            const isWarning = notif.type === 'warning';
            const isReminder = notif.type === 'reminder';

            return (
              <div
                key={notif._id}
                onClick={() => {
                  if (notif.article) {
                    const artId = notif.article._id || notif.article;
                    navigate(`/articles/${artId}`);
                  }
                }}
                className={`group flex items-start justify-between gap-4 rounded-2xl border p-4.5 transition-all cursor-pointer ${
                  !notif.read
                    ? 'border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
                      isWarning
                        ? 'bg-rose-50 text-rose-600 ring-rose-500/20'
                        : isReminder
                        ? 'bg-amber-50 text-amber-600 ring-amber-500/20'
                        : 'bg-emerald-50 text-emerald-600 ring-emerald-500/20'
                    }`}
                  >
                    {isWarning ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : isReminder ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {notif.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{formatRelativeTime(notif.createdAt)}</span>
                      <span>•</span>
                      <span>{formatDate(notif.createdAt)}</span>
                      {notif.articleTitle && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">
                            Article: {notif.articleTitle}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif._id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {notif.article && (
                    <span className="p-1.5 text-slate-400 group-hover:text-slate-700">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
