import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  History,
  CheckCircle2,
  FilePlus,
  FileEdit,
  Trash2,
  UserCheck,
  UserPlus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { formatRelativeTime, formatDateTime } from '../utils/dateUtils';

const ActivityLogPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useOutletContext();

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getRecentActivity(50);
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch (err) {
      showToast('Failed to load activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case 'article_reviewed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'article_created':
        return <FilePlus className="w-4 h-4 text-blue-600" />;
      case 'article_updated':
        return <FileEdit className="w-4 h-4 text-indigo-600" />;
      case 'article_deleted':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      case 'owner_assigned':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'user_created':
      case 'role_updated':
        return <UserPlus className="w-4 h-4 text-slate-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Activity & Audit Log
            </h1>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              {activities.length} events
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Immutable timeline of article creations, reviews, owner reassignments, and updates.
          </p>
        </div>

        <button
          onClick={fetchActivities}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Log
        </button>
      </div>

      {/* Activity Timeline Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <History className="mx-auto h-12 w-12 text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No activity events recorded yet.</p>
          </div>
        ) : (
          <div className="relative pl-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 space-y-6">
            {activities.map((act) => {
              const userInitial = act.user?.name ? act.user.name[0] : 'U';

              return (
                <div key={act._id} className="relative group">
                  {/* Timeline node */}
                  <div className="absolute -left-6 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-200 shadow-2xs group-hover:scale-110 transition-transform">
                    {getActionIcon(act.action)}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50 hover:border-slate-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {act.user?.name || 'Knowledge System'}
                        </span>
                        {act.user?.role && (
                          <span className="text-[10px] rounded bg-white px-1.5 py-0.2 border border-slate-200 font-semibold text-slate-600">
                            {act.user.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {formatRelativeTime(act.timestamp || act.createdAt)} ({formatDateTime(act.timestamp || act.createdAt)})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {act.details}
                    </p>

                    {act.article && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Linked Article:{' '}
                          <strong className="text-slate-800">
                            {act.articleTitle || act.article.title || 'View Article'}
                          </strong>
                        </span>
                        <Link
                          to={`/articles/${act.article._id || act.article}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          View Article
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
