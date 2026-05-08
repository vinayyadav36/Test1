import { Router } from 'express';
import { authMiddleware } from '../../core/middleware/authMiddleware';
import { tenantMiddleware } from '../../core/middleware/tenantMiddleware';
import {
  createProductHandler,
  getRestockSuggestionsHandler,
  listProductsHandler,
  recordMovementHandler,
} from '../controllers/inventoryController';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.post('/products', createProductHandler);
router.get('/products', listProductsHandler);
router.post('/movements', recordMovementHandler);
router.get('/restock', getRestockSuggestionsHandler);

export default router;
