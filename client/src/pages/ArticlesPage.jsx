import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  CheckSquare,
  Users,
  LayoutGrid,
  List,
  RefreshCw,
  X,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ReviewModal from '../components/ReviewModal';
import ConfirmModal from '../components/ConfirmModal';
import { articleService } from '../services/articleService';
import { userService } from '../services/userService';
import { formatDate } from '../utils/dateUtils';
import { CATEGORIES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

const ArticlesPage = () => {
  const { user, canEditArticle, canReviewArticle, canDeleteArticle, canCreateArticle } = useAuth();
  const { showToast, refreshNotifications } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & filter state from URL or defaults
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedOwner, setSelectedOwner] = useState(searchParams.get('owner') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'nextReview');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [articles, setArticles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [reviewModalArticle, setReviewModalArticle] = useState(null);
  const [deleteModalArticle, setDeleteModalArticle] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state when URL params change (e.g. from navbar search or card click)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlStatus = searchParams.get('status') || 'All';
    const urlCategory = searchParams.get('category') || 'All';
    setSearchQuery(urlSearch);
    setSelectedStatus(urlStatus);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  // Fetch users for owner filter dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        if (res.success && res.data) {
          setUsersList(res.data);
        }
      } catch (err) {
        console.error('Failed to load owners:', err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch articles based on active filters
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        owner: selectedOwner !== 'All' ? selectedOwner : undefined,
        sortBy,
        sortOrder,
      };

      const res = await articleService.getArticles(params);
      if (res.success && res.data) {
        setArticles(res.data);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
      showToast('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedStatus, selectedCategory, selectedOwner, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedOwner('All');
    setSortBy('nextReview');
    setSearchParams({});
  };

  const handleReviewSubmit = async (notes) => {
    if (!reviewModalArticle) return;
    try {
      const res = await articleService.markAsReviewed(reviewModalArticle._id, notes);
      showToast(res.message || 'Article marked as reviewed!');
      setReviewModalArticle(null);
      fetchArticles();
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review article', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalArticle) return;
    setIsDeleting(true);
    try {
      await articleService.deleteArticle(deleteModalArticle._id);
      showToast(`Article "${deleteModalArticle.title}" deleted successfully.`);
      setDeleteModalArticle(null);
      fetchArticles();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete article', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Knowledge Articles
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Governed register of internal instructions, standard operating procedures, and review cadences.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canCreateArticle() && (
            <Link
              to="/articles/create"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition-all hover:scale-102"
            >
              <Plus className="h-4 w-4" />
              Add Article
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by article title, description, tags, category..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Current">Current (Healthy)</option>
              <option value="Due Soon">Due Soon (≤30d)</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Owner
            </label>
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="All">All Owners</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="nextReview">Next Review Date</option>
              <option value="mostOverdue">Most Overdue First</option>
              <option value="lastReviewed">Recently Reviewed</option>
              <option value="title">Article Title (A-Z)</option>
            </select>
          </div>

          {/* Reset Filters / Toggle View */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 rounded-xl border border-slate-200 py-2 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
              title="Reset all filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>

            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-400'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-400'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Articles Content */}
      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Updating register...</p>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-900">No knowledge articles found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or create a new article.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear Filters
            </button>
            {canCreateArticle() && (
              <Link
                to="/articles/create"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
              >
                Create Article
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Professional Enterprise Data Table */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 pl-6 pr-4">Article</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Last Reviewed</th>
                  <th className="py-3.5 px-4">Interval</th>
                  <th className="py-3.5 px-4">Next Review</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {articles.map((art) => {
                  const allowedToEdit = canEditArticle(art);
                  const allowedToReview = canReviewArticle(art);
                  const allowedToDelete = canDeleteArticle();

                  return (
                    <tr
                      key={art._id}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Title & Description */}
                      <td className="py-4 pl-6 pr-4 max-w-xs">
                        <Link
                          to={`/articles/${art._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 text-xs"
                        >
                          {art.title}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                          {art.description}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs">
                          {art.category}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px] ring-1 ring-indigo-500/10">
                            {art.owner?.name ? art.owner.name[0] : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 text-xs">
                              {art.owner?.name || 'Unassigned'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {art.owner?.department || 'Operations'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Last Reviewed */}
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                        {formatDate(art.lastReviewedDate)}
                      </td>

                      {/* Review Interval */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-600 font-semibold">
                        {art.reviewInterval} days
                      </td>

                      {/* Next Review */}
                      <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-900">
                        {formatDate(art.nextReviewDate)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge
                          status={art.status}
                          daysRemaining={art.daysRemaining}
                          statusText={art.statusText}
                          size="sm"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/articles/${art._id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View article details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {allowedToReview && (
                            <button
                              onClick={() => setReviewModalArticle(art)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Mark as reviewed"
                            >
                              <CheckSquare className="w-4 h-4" />
                            </button>
                          )}

                          {allowedToEdit && (
                            <Link
                              to={`/articles/${art._id}/edit`}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit article"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}

                          {allowedToDelete && (
                            <button
                              onClick={() => setDeleteModalArticle(art)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete article"
                            >
                              <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Responsive Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => {
            const allowedToEdit = canEditArticle(art);
            const allowedToReview = canReviewArticle(art);
            const allowedToDelete = canDeleteArticle();

            return (
              <div
                key={art._id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {art.category}
                    </span>
                    <StatusBadge
                      status={art.status}
                      daysRemaining={art.daysRemaining}
                      statusText={art.statusText}
                      size="sm"
                    />
                  </div>

                  <Link
                    to={`/articles/${art._id}`}
                    className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2"
                  >
                    {art.title}
                  </Link>

                  <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                    {art.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Owner</span>
                      <strong className="text-slate-800 truncate block">
                        {art.owner?.name || 'Unassigned'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Next Review</span>
                      <strong className="text-slate-800 block">
                        {formatDate(art.nextReviewDate)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Interval: {art.reviewInterval} days
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/articles/${art._id}`}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {allowedToReview && (
                      <button
                        onClick={() => setReviewModalArticle(art)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50"
                        title="Mark as reviewed"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                    )}
                    {allowedToEdit && (
                      <Link
                        to={`/articles/${art._id}/edit`}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                    {allowedToDelete && (
                      <button
                        onClick={() => setDeleteModalArticle(art)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!reviewModalArticle}
        onClose={() => setReviewModalArticle(null)}
        article={reviewModalArticle}
        onConfirm={handleReviewSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteModalArticle}
        onClose={() => setDeleteModalArticle(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Knowledge Article"
        message={`Are you sure you want to permanently delete "${deleteModalArticle?.title}"? This action cannot be undone.`}
        confirmText="Delete Article"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ArticlesPage;
