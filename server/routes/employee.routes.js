import { Router } from 'express';
import { getEmployees, addEmployee, deleteEmployee } from '../controllers/employee.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, getEmployees);
router.post('/', authMiddleware, addEmployee);
router.delete('/:id', authMiddleware, deleteEmployee);

export default router;
