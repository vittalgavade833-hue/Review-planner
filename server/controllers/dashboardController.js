import Article from '../models/Article.js';
import Activity from '../models/Activity.js';
import { calculateNextReviewDate, calculateReviewStatus } from '../utils/reviewCalculator.js';

export const getDashboardStats = async (req, res) => {
  try {
    const articles = await Article.find({})
      .populate('owner', 'name email role department')
      .sort({ nextReviewDate: 1 });

    let total = articles.length;
    let currentCount = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;

    const categoryCounts = {
      HR: 0,
      IT: 0,
      Finance: 0,
      Operations: 0,
      Security: 0,
      Product: 0,
      Engineering: 0,
      Other: 0,
    };

    const enrichedArticles = articles.map((doc) => {
      const art = doc.toObject();
      const nextDate = calculateNextReviewDate(art.lastReviewedDate, art.reviewInterval);
      const reviewStatus = calculateReviewStatus(nextDate);

      art.nextReviewDate = nextDate;
      art.status = reviewStatus.status;
      art.daysRemaining = reviewStatus.daysRemaining;
      art.statusText = reviewStatus.statusText;
      art.badgeColor = reviewStatus.badgeColor;

      // Stats accumulation
      if (reviewStatus.status === 'CURRENT') currentCount++;
      else if (reviewStatus.status === 'DUE SOON') dueSoonCount++;
      else if (reviewStatus.status === 'OVERDUE') overdueCount++;

      // Category accumulation
      if (categoryCounts[art.category] !== undefined) {
        categoryCounts[art.category]++;
      } else {
        categoryCounts['Other']++;
      }

      return art;
    });

    // Knowledge Health Percentage
    // Formula: (Current articles / Total articles) * 100
    const healthScore = total > 0 ? Math.round((currentCount / total) * 100) : 100;

    // Articles Requiring Attention: Most urgent overdue first, then due soon
    const requiringAttention = enrichedArticles
      .filter((a) => a.status === 'OVERDUE' || a.status === 'DUE SOON')
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 6);

    // Status Distribution Chart Data
    const statusDistribution = [
      { name: 'Current', value: currentCount, color: '#10b981' },
      { name: 'Due Soon', value: dueSoonCount, color: '#f59e0b' },
      { name: 'Overdue', value: overdueCount, color: '#ef4444' },
    ];

    // Category Distribution Chart Data
    const categoryDistribution = Object.keys(categoryCounts)
      .filter((cat) => categoryCounts[cat] > 0 || ['HR', 'IT', 'Finance', 'Operations', 'Security'].includes(cat))
      .map((cat) => ({
        category: cat,
        count: categoryCounts[cat] || 0,
      }));

    // Monthly review projection or activity summary
    const monthlySummary = [
      { name: 'Overdue', count: overdueCount },
      { name: 'Within 30d', count: dueSoonCount },
      { name: 'Healthy', count: currentCount },
    ];

    res.json({
      success: true,
      stats: {
        totalArticles: total,
        current: currentCount,
        dueSoon: dueSoonCount,
        overdue: overdueCount,
        healthScore,
        healthDescription: `${healthScore}% of your knowledge base is currently review-ready.`,
      },
      charts: {
        statusDistribution,
        categoryDistribution,
        monthlySummary,
      },
      requiringAttention,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard stats',
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 15;
    const activities = await Activity.find({})
      .populate('user', 'name email role department')
      .populate('article', 'title category status')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch activity log',
    });
  }
};
