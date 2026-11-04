import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  CheckSquare,
  Edit,
  Trash2,
  CheckCircle2,
  History,
  FileText,
  AlertTriangle,
  Building,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ReviewModal from '../components/ReviewModal';
import ConfirmModal from '../components/ConfirmModal';
import { articleService } from '../services/articleService';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, refreshNotifications } = useOutletContext();
  const { user, canEditArticle, canReviewArticle, canDeleteArticle } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await articleService.getArticleById(id);
      if (res.success && res.data) {
        setArticle(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch article details:', err);
      showToast('Article not found or server error', 'error');
      navigate('/articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const handleReviewSubmit = async (notes) => {
    try {
      const res = await articleService.markAsReviewed(id, notes);
      showToast(res.message || 'Article marked as reviewed!');
      setShowReviewModal(false);
      fetchArticle();
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review article', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await articleService.deleteArticle(id);
      showToast('Article deleted successfully.');
      navigate('/articles');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete article', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) return null;

  const allowedToEdit = canEditArticle(article);
  const allowedToReview = canReviewArticle(article);
  const allowedToDelete = canDeleteArticle();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        <div className="flex flex-wrap items-center gap-2.5">
          {allowedToReview && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              Mark as Reviewed
            </button>
          )}

          {allowedToEdit && (
            <Link
              to={`/articles/${article._id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Edit className="w-4 h-4 text-blue-600" />
              Edit
            </Link>
          )}

          {allowedToDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Header Card with Review Governance Specs */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-700 uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Interval: <strong className="text-slate-700">{article.reviewInterval} days</strong>
            </span>
          </div>

          <StatusBadge
            status={article.status}
            daysRemaining={article.daysRemaining}
            statusText={article.statusText}
            size="lg"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed font-medium">
          {article.description}
        </p>

        {/* Governance Metadata Ribbon */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Accountable Owner
              </span>
              <strong className="text-xs text-slate-900 block truncate">
                {article.owner?.name || 'Unassigned'}
              </strong>
              <span className="text-[10px] text-slate-500 block">
                {article.owner?.department || 'Operations'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Last Reviewed
              </span>
              <strong className="text-xs text-slate-900 block">
                {formatDate(article.lastReviewedDate)}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Next Review Due
              </span>
              <strong className="text-xs text-indigo-950 font-black block">
                {formatDate(article.nextReviewDate)}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                article.status === 'OVERDUE'
                  ? 'bg-rose-50 text-rose-600'
                  : article.status === 'DUE SOON'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Countdown
              </span>
              <strong
                className={`text-xs font-bold block ${
                  article.status === 'OVERDUE'
                    ? 'text-rose-600'
                    : article.status === 'DUE SOON'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {article.statusText}
              </strong>
            </div>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-4 border-t border-slate-100">
            <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Full Article Content */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Standard Operating Documentation</h2>
        </div>

        <div className="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
          {article.content}
        </div>
      </div>

      {/* Review History Audit Trail */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Review & Audit History</h3>
        </div>

        {article.reviewHistory && article.reviewHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {article.reviewHistory.map((hist, idx) => (
              <div key={idx} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Reviewed by {hist.reviewedBy?.name || 'Knowledge Owner'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{hist.notes || 'Routine review verification.'}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                  {formatDateTime(hist.reviewedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">No previous review iterations recorded yet.</p>
        )}
      </div>

      {/* Review Confirmation Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        article={article}
        onConfirm={handleReviewSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Knowledge Article"
        message={`Are you sure you want to permanently delete "${article.title}"?`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ArticleDetailPage;
