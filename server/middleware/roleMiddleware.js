import Article from '../models/Article.js';

/**
 * Restrict access to specified roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource.`,
      });
    }

    next();
  };
};

/**
 * Check if the user can modify or delete a specific article
 * - Admin: Can modify any article
 * - Knowledge Owner: Can modify article only if they are the owner or creator
 * - Viewer: Read-only, cannot modify
 */
export const canModifyArticle = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Attach article to request so controller doesn't need to fetch it again
    req.targetArticle = article;

    if (req.user.role === 'Admin') {
      return next();
    }

    if (req.user.role === 'Knowledge Owner') {
      const isOwner = article.owner && article.owner.toString() === req.user._id.toString();
      const isCreator = article.createdBy && article.createdBy.toString() === req.user._id.toString();

      if (isOwner || isCreator) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Permission denied. Knowledge Owners can only edit or update their own assigned articles.',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Viewers have read-only access and cannot edit or delete articles.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Authorization check failed',
    });
  }
};

/**
 * Check if the user can review an article
 * - Admin: Can review any article
 * - Knowledge Owner: Can review assigned articles
 * - Viewer: Cannot review
 */
export const canReviewArticle = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    req.targetArticle = article;

    if (req.user.role === 'Admin') {
      return next();
    }

    if (req.user.role === 'Knowledge Owner') {
      const isOwner = article.owner && article.owner.toString() === req.user._id.toString();
      if (isOwner) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Permission denied. Only the assigned Knowledge Owner or an Admin can mark this article as reviewed.',
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Viewers have read-only access and cannot review articles.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Authorization check failed',
    });
  }
};
