import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/notificationService';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

import { ToastContext } from '../context/ToastContext';

const AppLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const location = useLocation();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      // ignore silent notification errors
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll every 30 seconds for real-time alerts
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading KnowledgeTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadNotificationsCount={unreadCount}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            onNotificationUpdated={fetchNotifications}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet context={{ showToast, refreshNotifications: fetchNotifications }} />
          </main>
        </div>

        {/* Global Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 text-white p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200 border border-slate-800 max-w-md">
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <p className="text-xs font-medium leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export default AppLayout;
