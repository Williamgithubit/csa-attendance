import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { ROLES } from '../models/index.js';

const router = express.Router();

// Public routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/forgotPassword', userController.forgotPassword);
router.patch('/resetPassword/:token', userController.resetPassword);

// Protected routes - require authentication
router.use(protect);

// User profile routes
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', userController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Admin routes - require admin or super admin role
router.use(restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
