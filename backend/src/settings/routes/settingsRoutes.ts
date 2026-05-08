import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import { getSettingsHandler, updateSettingsHandler } from '../controllers/settingsController';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.get('/', getSettingsHandler);
router.patch('/', updateSettingsHandler);

export default router;
