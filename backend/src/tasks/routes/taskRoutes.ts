import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import { listTasksHandler, updateTaskStatusHandler } from '../controllers/taskController';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.get('/', listTasksHandler);
router.patch('/:id', updateTaskStatusHandler);

export default router;
