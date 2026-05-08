import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import { getFullExportHandler } from '../controllers/exportController';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.get('/all', getFullExportHandler);

export default router;
