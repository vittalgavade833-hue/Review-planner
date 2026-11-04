import express from 'express';
import { body } from 'express-validator';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  markArticleAsReviewed,
  getReviewCalendar,
} from '../controllers/articleController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  authorizeRoles,
  canModifyArticle,
  canReviewArticle,
} from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect); // All article routes are protected

router.get('/', getArticles);
router.get('/calendar', getReviewCalendar);
router.get('/:id', getArticleById);

router.post(
  '/',
  authorizeRoles('Admin', 'Knowledge Owner'),
  [
    body('title').trim().notEmpty().withMessage('Article title is required'),
    body('description').trim().notEmpty().withMessage('Short description is required'),
    body('content').trim().notEmpty().withMessage('Article content is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('reviewInterval').isInt().withMessage('Review interval must be a valid number of days'),
  ],
  validateRequest,
  createArticle
);

router.put('/:id', canModifyArticle, updateArticle);
router.delete('/:id', authorizeRoles('Admin'), deleteArticle);
router.post('/:id/review', canReviewArticle, markArticleAsReviewed);

export default router;
