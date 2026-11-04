import express from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(protect);

// Allow Admin and Knowledge Owner to view users (needed for assigning owner dropdown)
router.get('/', getUsers);

// Only Admin can create, modify, or delete users
router.post(
  '/',
  authorizeRoles('Admin'),
  [
    body('name').trim().notEmpty().withMessage('User name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['Admin', 'Knowledge Owner', 'Viewer']).withMessage('Valid role is required'),
  ],
  validateRequest,
  createUser
);

router.put('/:id', authorizeRoles('Admin'), updateUser);
router.delete('/:id', authorizeRoles('Admin'), deleteUser);

export default router;
