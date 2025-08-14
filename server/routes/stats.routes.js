import { Router } from 'express';
import { getStats, getDashboardStats } from '../controllers/stats.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getStats);
router.get('/dashboard', authMiddleware, getDashboardStats);

export default router;
