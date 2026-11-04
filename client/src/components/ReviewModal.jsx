import React, { useState } from 'react';
import { CheckCircle2, X, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const ReviewModal = ({ isOpen, onClose, article, onConfirm }) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !article) return null;

  // Calculate what the new next review date will be (today + interval)
  const today = new Date();
  const nextDate = new Date(today.getTime() + Number(article.reviewInterval) * 24 * 60 * 60 * 1000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Mark Article as Reviewed</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{article.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Review Date Summary Card */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Previous Last Reviewed:</span>
              <span className="font-semibold text-slate-900">{formatDate(article.lastReviewedDate)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">New Last Reviewed Date:</span>
              <span className="font-bold text-emerald-700">{formatDate(today)} (Today)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">Review Interval:</span>
              <span className="font-semibold text-slate-900">{article.reviewInterval} days</span>
            </div>
            <div className="border-t border-emerald-200/60 pt-2 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                New Next Review Date:
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-xs font-extrabold">
                {formatDate(nextDate)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Review Verification Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified steps against new product v4.2 release, updated external vendor links..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Confirming Review...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
