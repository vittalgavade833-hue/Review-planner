import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Eye,
  CheckSquare,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ReviewModal from '../components/ReviewModal';
import { dashboardService } from '../services/dashboardService';
import { articleService } from '../services/articleService';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, canReviewArticle } = useAuth();
  const { showToast, refreshNotifications } = useOutletContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedArticleForReview, setSelectedArticleForReview] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, activityRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(8),
      ]);

      if (statsRes.success) {
        setDashboardData(statsRes);
      }
      if (activityRes.success) {
        setRecentActivities(activityRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      showToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleReviewSubmit = async (notes) => {
    if (!selectedArticleForReview) return;
    try {
      const res = await articleService.markAsReviewed(selectedArticleForReview._id, notes);
      showToast(res.message || 'Article marked as reviewed!');
      setSelectedArticleForReview(null);
      fetchDashboard();
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review article', 'error');
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading Knowledge Overview...</p>
        </div>
      </div>
    );
  }

  const { stats, charts, requiringAttention = [] } = dashboardData || {};

  const statusPieData = charts?.statusDistribution || [];
  const categoryBarData = charts?.categoryDistribution || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Knowledge Overview
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Cadence
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Welcome back, <span className="font-bold text-slate-700">{user?.name}</span> ({user?.role}). Monitor review cycles and audit status in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            View Register
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Articles"
          value={stats?.totalArticles ?? 0}
          subtitle="Governed instructions"
          icon={FileText}
          variant="purple"
          onClick={() => navigate('/articles')}
        />
        <StatCard
          title="Current"
          value={stats?.current ?? 0}
          subtitle=">30 days review buffer"
          icon={CheckCircle2}
          variant="green"
          onClick={() => navigate('/articles?status=Current')}
        />
        <StatCard
          title="Due Soon"
          value={stats?.dueSoon ?? 0}
          subtitle="≤30 days remaining"
          icon={Clock}
          variant="yellow"
          onClick={() => navigate('/articles?status=Due+Soon')}
        />
        <StatCard
          title="Overdue"
          value={stats?.overdue ?? 0}
          subtitle="Past review schedule"
          icon={AlertTriangle}
          variant="red"
          onClick={() => navigate('/articles?status=Overdue')}
        />

        {/* Knowledge Health Metric Card */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-900 to-slate-900 p-5 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Knowledge Health
              </p>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">{stats?.healthScore ?? 100}%</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${stats?.healthScore ?? 100}%` }}
              />
            </div>
          </div>
          <p className="mt-3 text-[11px] font-medium text-indigo-200/90 leading-tight">
            {stats?.healthDescription || '100% of your knowledge base is currently review-ready.'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Article Status Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of active governance statuses</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} articles`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(val) => <span className="text-xs text-slate-700 font-semibold">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Articles by Category Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Articles by Category</h3>
              <p className="text-xs text-slate-500">Distribution across operational domains</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val) => [`${val} articles`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Dual Section: Articles Requiring Attention + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Articles Requiring Attention */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Articles Requiring Attention</h3>
                  <p className="text-xs text-slate-500">Most urgent overdue and upcoming review deadlines</p>
                </div>
              </div>
              <Link
                to="/articles?status=Overdue"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {requiringAttention.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold">Zero articles currently require attention!</p>
                  <p className="text-[11px]">All documentation is healthy and within review intervals.</p>
                </div>
              ) : (
                requiringAttention.map((art) => {
                  const allowedToReview = canReviewArticle(art);
                  return (
                    <div
                      key={art._id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-slate-50 hover:border-slate-200 transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
                            {art.category}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium truncate">
                            Owner: <strong className="text-slate-700">{art.owner?.name || 'Unassigned'}</strong>
                          </span>
                        </div>
                        <Link
                          to={`/articles/${art._id}`}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {art.title}
                        </Link>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge
                          status={art.status}
                          daysRemaining={art.daysRemaining}
                          statusText={art.statusText}
                          size="sm"
                        />
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/articles/${art._id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 shadow-2xs transition-colors"
                            title="View article details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {allowedToReview && (
                            <button
                              onClick={() => setSelectedArticleForReview(art)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                              title="Mark as reviewed"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Review Activity</h3>
                  <p className="text-xs text-slate-500">Live governance and ownership events</p>
                </div>
              </div>
              <Link
                to="/activity"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Log
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentActivities.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">No activity logged yet.</p>
              ) : (
                recentActivities.map((act) => (
                  <div key={act._id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                      {act.user?.name ? act.user.name[0] : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 font-medium leading-snug">
                        {act.details}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeTime(act.timestamp || act.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal Dialog */}
      <ReviewModal
        isOpen={!!selectedArticleForReview}
        onClose={() => setSelectedArticleForReview(null)}
        article={selectedArticleForReview}
        onConfirm={handleReviewSubmit}
      />
    </div>
  );
};

export default DashboardPage;
