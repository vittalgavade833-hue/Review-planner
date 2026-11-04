import Article from '../models/Article.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import {
  calculateNextReviewDate,
  calculateReviewStatus,
  computeArticleReviewFields,
} from '../utils/reviewCalculator.js';

/**
 * Format an article with live real-time calculated status and days remaining
 */
const enrichArticleWithLiveStatus = (articleDoc) => {
  const article = articleDoc.toObject ? articleDoc.toObject() : { ...articleDoc };
  if (article.lastReviewedDate && article.reviewInterval) {
    const nextDate = calculateNextReviewDate(article.lastReviewedDate, article.reviewInterval);
    const reviewInfo = calculateReviewStatus(nextDate);
    article.nextReviewDate = nextDate;
    article.status = reviewInfo.status;
    article.daysRemaining = reviewInfo.daysRemaining;
    article.statusText = reviewInfo.statusText;
    article.badgeColor = reviewInfo.badgeColor;
  }
  return article;
};

/**
 * @desc    Get all articles with search, filtering, and sorting
 * @route   GET /api/articles
 * @access  Private
 */
export const getArticles = async (req, res) => {
  try {
    const {
      search,
      status,
      category,
      owner,
      sortBy = 'nextReview',
      sortOrder = 'asc',
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Owner filter
    if (owner && owner !== 'All') {
      query.owner = owner;
    }

    // Role-based filtering if user is Knowledge Owner and requests only assigned
    if (req.query.assignedOnly === 'true' && req.user.role === 'Knowledge Owner') {
      query.owner = req.user._id;
    }

    // Text search by title, description, tags, category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');

      // Also check if search matches an owner name
      const matchingUsers = await User.find({ name: searchRegex }).select('_id');
      const matchingUserIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { category: searchRegex },
        ...(matchingUserIds.length > 0 ? [{ owner: { $in: matchingUserIds } }] : []),
      ];
    }

    // Fetch articles from DB with owner and createdBy populated
    let articles = await Article.find(query)
      .populate('owner', 'name email role department')
      .populate('createdBy', 'name email role')
      .sort({ updatedAt: -1 });

    // Enrich all with live real-time status dynamically calculated from today's date
    let enriched = articles.map(enrichArticleWithLiveStatus);

    // Filter by dynamic status if specified
    if (status && status !== 'All') {
      enriched = enriched.filter((a) => a.status.toUpperCase() === status.toUpperCase());
    }

    // Dynamic sorting
    enriched.sort((a, b) => {
      if (sortBy === 'title') {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'desc' ? titleB.localeCompare(titleA) : titleA.localeCompare(titleB);
      }
      if (sortBy === 'lastReviewed') {
        const dateA = new Date(a.lastReviewedDate).getTime();
        const dateB = new Date(b.lastReviewedDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === 'mostOverdue') {
        // Smaller daysRemaining means most overdue first
        return a.daysRemaining - b.daysRemaining;
      }
      // default: nextReview
      const dateA = new Date(a.nextReviewDate).getTime();
      const dateB = new Date(b.nextReviewDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch articles',
    });
  }
};

/**
 * @desc    Get single article by ID
 * @route   GET /api/articles/:id
 * @access  Private
 */
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('owner', 'name email role department')
      .populate('createdBy', 'name email role')
      .populate('reviewHistory.reviewedBy', 'name email role');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const enriched = enrichArticleWithLiveStatus(article);

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch article details',
    });
  }
};

/**
 * @desc    Create a new article
 * @route   POST /api/articles
 * @access  Private (Admin & Knowledge Owner)
 */
export const createArticle = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      owner,
      lastReviewedDate,
      reviewInterval,
      tags,
    } = req.body;

    const assignedOwner = owner || req.user._id;
    const interval = Number(reviewInterval) || 90;
    const reviewedDate = lastReviewedDate ? new Date(lastReviewedDate) : new Date();

    const computed = computeArticleReviewFields(reviewedDate, interval);

    const article = await Article.create({
      title,
      description,
      content,
      category: category || 'Operations',
      owner: assignedOwner,
      lastReviewedDate: reviewedDate,
      reviewInterval: interval,
      nextReviewDate: computed.nextReviewDate,
      status: computed.status,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t) => t.trim()) : []),
      createdBy: req.user._id,
      reviewHistory: [
        {
          reviewedBy: req.user._id,
          reviewedAt: reviewedDate,
          notes: 'Initial creation & baseline review',
        },
      ],
    });

    // Populate for response
    await article.populate('owner', 'name email role department');
    await article.populate('createdBy', 'name email role');

    // Create activity log
    await Activity.create({
      user: req.user._id,
      action: 'article_created',
      article: article._id,
      articleTitle: article.title,
      details: `${req.user.name} created article "${article.title}"`,
    });

    // Notify assigned owner if different from creator
    if (assignedOwner.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: assignedOwner,
        message: `You have been assigned as owner for "${article.title}"`,
        type: 'info',
        article: article._id,
        articleTitle: article.title,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: enrichArticleWithLiveStatus(article),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create article',
    });
  }
};

/**
 * @desc    Update an article
 * @route   PUT /api/articles/:id
 * @access  Private (Admin or assigned Knowledge Owner)
 */
export const updateArticle = async (req, res) => {
  try {
    const article = req.targetArticle || (await Article.findById(req.params.id));

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const {
      title,
      description,
      content,
      category,
      owner,
      lastReviewedDate,
      reviewInterval,
      tags,
    } = req.body;

    const previousOwner = article.owner ? article.owner.toString() : null;

    if (title) article.title = title;
    if (description) article.description = description;
    if (content) article.content = content;
    if (category) article.category = category;
    if (tags) {
      article.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }

    // Only Admin can reassign owner, or keep same
    if (owner && (req.user.role === 'Admin' || owner === article.owner.toString())) {
      article.owner = owner;
    }

    if (lastReviewedDate) {
      article.lastReviewedDate = new Date(lastReviewedDate);
    }

    if (reviewInterval) {
      article.reviewInterval = Number(reviewInterval);
    }

    // Recompute nextReviewDate and status
    const computed = computeArticleReviewFields(article.lastReviewedDate, article.reviewInterval);
    article.nextReviewDate = computed.nextReviewDate;
    article.status = computed.status;

    await article.save();
    await article.populate('owner', 'name email role department');
    await article.populate('createdBy', 'name email role');

    // Activity log
    await Activity.create({
      user: req.user._id,
      action: 'article_updated',
      article: article._id,
      articleTitle: article.title,
      details: `${req.user.name} updated "${article.title}"`,
    });

    // If owner changed, notify new owner and log
    if (owner && previousOwner && owner !== previousOwner) {
      await Activity.create({
        user: req.user._id,
        action: 'owner_assigned',
        article: article._id,
        articleTitle: article.title,
        details: `Owner for "${article.title}" reassigned to ${article.owner.name}`,
      });

      await Notification.create({
        user: owner,
        message: `You were assigned as owner for "${article.title}"`,
        type: 'info',
        article: article._id,
        articleTitle: article.title,
      });
    }

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: enrichArticleWithLiveStatus(article),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update article',
    });
  }
};

/**
 * @desc    Delete an article
 * @route   DELETE /api/articles/:id
 * @access  Private (Admin only)
 */
export const deleteArticle = async (req, res) => {
  try {
    const article = req.targetArticle || (await Article.findById(req.params.id));

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const title = article.title;
    await Article.findByIdAndDelete(article._id);

    // Record activity
    await Activity.create({
      user: req.user._id,
      action: 'article_deleted',
      articleTitle: title,
      details: `${req.user.name} deleted article "${title}"`,
    });

    res.json({
      success: true,
      message: `Article "${title}" deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete article',
    });
  }
};

/**
 * @desc    Mark article as reviewed
 * @route   POST /api/articles/:id/review
 * @access  Private (Admin or assigned Knowledge Owner)
 */
export const markArticleAsReviewed = async (req, res) => {
  try {
    const article = req.targetArticle || (await Article.findById(req.params.id));

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    const today = new Date();
    article.lastReviewedDate = today;

    // Recalculate nextReviewDate and status
    const computed = computeArticleReviewFields(today, article.reviewInterval);
    article.nextReviewDate = computed.nextReviewDate;
    article.status = computed.status;

    // Push into review history
    article.reviewHistory.unshift({
      reviewedBy: req.user._id,
      reviewedAt: today,
      notes: req.body.notes || 'Routine knowledge accuracy review completed.',
    });

    await article.save();
    await article.populate('owner', 'name email role department');
    await article.populate('createdBy', 'name email role');

    // Create activity log
    await Activity.create({
      user: req.user._id,
      action: 'article_reviewed',
      article: article._id,
      articleTitle: article.title,
      details: `${req.user.name} reviewed "${article.title}"`,
    });

    // Format readable next review date
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedNextDate = new Intl.DateTimeFormat('en-GB', options).format(computed.nextReviewDate);

    // In-app notification for owner / stakeholders
    await Notification.create({
      user: article.owner._id || article.owner,
      message: `Article "${article.title}" was reviewed successfully. Next review due on ${formattedNextDate}.`,
      type: 'success',
      article: article._id,
      articleTitle: article.title,
    });

    res.json({
      success: true,
      message: `Article reviewed successfully. Next review is due on ${formattedNextDate}.`,
      data: enrichArticleWithLiveStatus(article),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark article as reviewed',
    });
  }
};

/**
 * @desc    Get upcoming review calendar items
 * @route   GET /api/articles/calendar
 * @access  Private
 */
export const getReviewCalendar = async (req, res) => {
  try {
    const articles = await Article.find({})
      .populate('owner', 'name email role department')
      .select('title category owner lastReviewedDate reviewInterval nextReviewDate status tags')
      .sort({ nextReviewDate: 1 });

    const enriched = articles.map(enrichArticleWithLiveStatus);

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch calendar data',
    });
  }
};
