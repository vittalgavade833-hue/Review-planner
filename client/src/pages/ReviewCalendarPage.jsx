import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  CheckSquare,
  Filter,
} from 'lucide-react';
import { articleService } from '../services/articleService';
import StatusBadge from '../components/StatusBadge';
import ReviewModal from '../components/ReviewModal';
import { formatDate } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';

const ReviewCalendarPage = () => {
  const { canReviewArticle } = useAuth();
  const { showToast, refreshNotifications } = useOutletContext();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('All'); // 'All', 'OVERDUE', 'DUE SOON', 'CURRENT'
  const [selectedArticleForReview, setSelectedArticleForReview] = useState(null);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await articleService.getReviewCalendar();
      if (res.success && res.data) {
        setArticles(res.data);
      }
    } catch (err) {
      showToast('Failed to load review calendar', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleReviewSubmit = async (notes) => {
    if (!selectedArticleForReview) return;
    try {
      const res = await articleService.markAsReviewed(selectedArticleForReview._id, notes);
      showToast(res.message || 'Article marked as reviewed!');
      setSelectedArticleForReview(null);
      fetchCalendar();
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review article', 'error');
    }
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const resetToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    currentDate
  );

  // Filter articles for currently displayed month
  const monthlyArticles = articles.filter((art) => {
    if (!art.nextReviewDate) return false;
    const d = new Date(art.nextReviewDate);
    const inMonth = d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    if (filterType === 'All') return inMonth;
    return inMonth && art.status === filterType;
  });

  // Also extract overdue articles that may have been due before this month
  const overdueBacklog = articles.filter((art) => art.status === 'OVERDUE');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Review Calendar
            </h1>
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Schedule & Deadlines
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Monitor upcoming review deadlines, inspect review cadences, and eliminate overdue backlogs.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToCurrentMonth}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-l-xl transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-36 text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-r-xl transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter View:
          </span>
          {['All', 'CURRENT', 'DUE SOON', 'OVERDUE'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'All' ? 'All Reviews' : type}
            </button>
          ))}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <strong>{monthlyArticles.length}</strong> scheduled in {monthName}
        </div>
      </div>

      {/* Overdue Backlog Alert Strip if any */}
      {overdueBacklog.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Active Overdue Backlog ({overdueBacklog.length} articles)
              </h3>
            </div>
            <span className="text-[11px] text-rose-700 font-medium">Immediate attention required</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overdueBacklog.map((art) => (
              <Link
                key={art._id}
                to={`/articles/${art._id}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100 shadow-2xs transition-colors"
              >
                <span>{art.title}</span>
                <span className="text-[10px] bg-rose-100 px-1.5 py-0.2 rounded font-mono text-rose-900">
                  {art.statusText}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Calendar List / Schedule View */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : monthlyArticles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No reviews scheduled in {monthName}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Navigate to other months using the arrows above to see scheduled review cadences.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Scheduled Review Date</th>
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Accountable Owner</th>
                  <th className="py-3.5 px-4">Cadence Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {monthlyArticles.map((art) => {
                  const allowedToReview = canReviewArticle(art);
                  return (
                    <tr key={art._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs ring-1 ring-indigo-500/10">
                            {new Date(art.nextReviewDate).getDate()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {formatDate(art.nextReviewDate)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Every {art.reviewInterval} days
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <Link
                          to={`/articles/${art._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {art.title}
                        </Link>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {art.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {art.owner?.name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge
                          status={art.status}
                          daysRemaining={art.daysRemaining}
                          statusText={art.statusText}
                          size="sm"
                        />
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/articles/${art._id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {allowedToReview && (
                            <button
                              onClick={() => setSelectedArticleForReview(art)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              Review Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!selectedArticleForReview}
        onClose={() => setSelectedArticleForReview(null)}
        article={selectedArticleForReview}
        onConfirm={handleReviewSubmit}
      />
    </div>
  );
};

export default ReviewCalendarPage;
