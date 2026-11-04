import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { articleService } from '../services/articleService';
import { userService } from '../services/userService';
import { CATEGORIES, REVIEW_INTERVALS } from '../utils/constants';
import { calculateNextReviewDate, formatDate, calculateStatusInfo } from '../utils/dateUtils';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, refreshNotifications } = useOutletContext();
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Operations',
    owner: '',
    lastReviewedDate: '',
    reviewInterval: 90,
    tags: '',
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [artRes, userRes] = await Promise.all([
          articleService.getArticleById(id),
          userService.getUsers(),
        ]);

        if (artRes.success && artRes.data) {
          const art = artRes.data;
          setFormData({
            title: art.title,
            description: art.description,
            content: art.content,
            category: art.category,
            owner: art.owner?._id || art.owner,
            lastReviewedDate: art.lastReviewedDate ? art.lastReviewedDate.split('T')[0] : '',
            reviewInterval: art.reviewInterval || 90,
            tags: art.tags ? art.tags.join(', ') : '',
          });
        }

        if (userRes.success && userRes.data) {
          setUsersList(userRes.data);
        }
      } catch (err) {
        showToast('Failed to load article details', 'error');
        navigate('/articles');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const calculatedNextDate = calculateNextReviewDate(
    formData.lastReviewedDate,
    formData.reviewInterval
  );
  const calculatedStatusInfo = calculateStatusInfo(calculatedNextDate);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Article title is required';
    if (!formData.description.trim()) newErrors.description = 'Short description is required';
    if (!formData.content.trim()) newErrors.content = 'Full article content is required';
    if (!formData.lastReviewedDate) newErrors.lastReviewedDate = 'Last reviewed date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        reviewInterval: Number(formData.reviewInterval),
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await articleService.updateArticle(id, payload);
      showToast('Article updated successfully!');
      if (refreshNotifications) refreshNotifications();
      navigate(`/articles/${id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update article', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading article editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <Link
          to={`/articles/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Back
        </Link>
        <span className="text-xs font-bold text-indigo-600">Edit Knowledge Article</span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Article</h1>
          <p className="mt-1 text-xs text-slate-500">
            Update documentation content, reassess cadence intervals, or assign owners.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-xl border p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full rounded-xl border p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 ${
                errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.description && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Owner {isAdmin ? '' : '(Admin only for reassignment)'}
              </label>
              <select
                name="owner"
                disabled={!isAdmin}
                value={formData.owner}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white p-3 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden ${
                  !isAdmin ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'border-slate-200'
                }`}
              >
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Reviewed Date
              </label>
              <input
                type="date"
                name="lastReviewedDate"
                value={formData.lastReviewedDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Review Interval
              </label>
              <select
                name="reviewInterval"
                value={formData.reviewInterval}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {REVIEW_INTERVALS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Preview */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Calculated Schedule Preview:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Next Review Date:</span>
                <span className="font-extrabold text-indigo-900">{formatDate(calculatedNextDate)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Status:</span>
                <div className="mt-1">
                  <StatusBadge
                    status={calculatedStatusInfo.status}
                    daysRemaining={calculatedStatusInfo.daysRemaining}
                    statusText={calculatedStatusInfo.statusText}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Article Content / Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleChange}
              className={`w-full rounded-xl border p-3.5 text-xs text-slate-900 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 font-mono leading-relaxed ${
                errors.content ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.content && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to={`/articles/${id}`}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticlePage;
