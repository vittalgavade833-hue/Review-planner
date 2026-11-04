import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { articleService } from '../services/articleService';
import { userService } from '../services/userService';
import { CATEGORIES, REVIEW_INTERVALS } from '../utils/constants';
import { calculateNextReviewDate, formatDate, calculateStatusInfo } from '../utils/dateUtils';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';

const CreateArticlePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast, refreshNotifications } = useOutletContext();

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Operations',
    owner: user?._id || '',
    lastReviewedDate: todayStr,
    reviewInterval: 90,
    tags: '',
  });

  const [usersList, setUsersList] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch owners
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        if (res.success && res.data) {
          setUsersList(res.data);
          if (!formData.owner && res.data.length > 0) {
            setFormData((prev) => ({ ...prev, owner: res.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Live dynamic calculation of next review date
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
    if (!formData.owner) newErrors.owner = 'Please select a designated owner';
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

      const res = await articleService.createArticle(payload);
      showToast('Article registered successfully!');
      if (refreshNotifications) refreshNotifications();
      navigate(`/articles/${res.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create article';
      showToast(msg, 'error');
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach((e) => {
          backendErrors[e.field] = e.message;
        });
        setErrors(backendErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Back
        </Link>
        <span className="text-xs font-bold text-indigo-600">Register New Document</span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add Knowledge Article</h1>
          <p className="mt-1 text-xs text-slate-500">
            Define knowledge title, designated owner, review interval, and standard procedures.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Article Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Employee Onboarding & Talent Integration SOP"
              className={`w-full rounded-xl border p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.title}</p>}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Short Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="One or two sentences explaining the scope and audience of this article"
              className={`w-full rounded-xl border p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 ${
                errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.description && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.description}</p>}
          </div>

          {/* Category & Owner Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
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
                Designated Owner <span className="text-rose-500">*</span>
              </label>
              <select
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className={`w-full rounded-xl border bg-white p-3 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 ${
                  errors.owner ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'
                }`}
              >
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role} — {u.department || 'Operations'})
                  </option>
                ))}
              </select>
              {errors.owner && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.owner}</p>}
            </div>
          </div>

          {/* Last Reviewed Date & Review Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Reviewed Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="lastReviewedDate"
                value={formData.lastReviewedDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
              />
              {errors.lastReviewedDate && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.lastReviewedDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Review Interval <span className="text-rose-500">*</span>
              </label>
              <select
                name="reviewInterval"
                value={formData.reviewInterval}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
              >
                {REVIEW_INTERVALS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Automatic Dynamic Calculation Preview Card */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-blue-50/30 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Automatic Review Schedule Preview:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block">Formula:</span>
                <span className="font-mono text-slate-700 text-[11px]">Last Reviewed + {formData.reviewInterval} days</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Calculated Next Review Date:</span>
                <span className="font-extrabold text-indigo-900">{formatDate(calculatedNextDate)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Initial Status:</span>
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

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Article Content / Instructions <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter standard operating instructions, checklist items, policy clauses, and operational workflows..."
              className={`w-full rounded-xl border p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15 font-mono leading-relaxed ${
                errors.content ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.content && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.content}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. Onboarding, HR, Compliance, IT Setup"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/articles"
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
                  Registering Article...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & Register Article
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticlePage;
