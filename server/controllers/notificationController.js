import Notification from '../models/Notification.js';
import Article from '../models/Article.js';
import { calculateNextReviewDate, calculateReviewStatus } from '../utils/reviewCalculator.js';

/**
 * @desc    Get all notifications for logged-in user + dynamically sync upcoming review alerts
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check user's assigned articles and generate dynamic alerts if not already notified
    const articles = await Article.find({ owner: userId });
    for (const art of articles) {
      const nextDate = calculateNextReviewDate(art.lastReviewedDate, art.reviewInterval);
      const statusInfo = calculateReviewStatus(nextDate);

      if (statusInfo.isOverdue) {
        // Check if an overdue alert already exists recently
        const exists = await Notification.findOne({
          user: userId,
          article: art._id,
          type: 'warning',
          read: false,
        });
        if (!exists) {
          await Notification.create({
            user: userId,
            message: `⚠️ "${art.title}" is overdue for review (${statusInfo.statusText}).`,
            type: 'warning',
            article: art._id,
            articleTitle: art.title,
          });
        }
      } else if (statusInfo.isDueSoon) {
        const exists = await Notification.findOne({
          user: userId,
          article: art._id,
          type: 'reminder',
          read: false,
        });
        if (!exists) {
          await Notification.create({
            user: userId,
            message: `🔔 "${art.title}" is due for review soon (${statusInfo.statusText}).`,
            type: 'reminder',
            article: art._id,
            articleTitle: art.title,
          });
        }
      }
    }

    const notifications = await Notification.find({ user: userId })
      .populate('article', 'title category status')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications',
    });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update notification',
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update notifications',
    });
  }
};
