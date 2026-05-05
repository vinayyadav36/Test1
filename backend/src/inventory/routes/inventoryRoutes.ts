import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import {
  createProduct,
  listProducts,
  recordMovement,
  getRestockSuggestions,
} from '../controllers/inventoryController';

const router = Router();

router.use(authMiddleware as any);
router.use(tenantMiddleware as any);

router.post('/products', createProduct as any);
router.get('/products', listProducts as any);
router.post('/movements', recordMovement as any);
router.get('/restock', getRestockSuggestions as any);

export default router;
