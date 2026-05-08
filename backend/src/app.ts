import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { errorHandler } from './common/errorHandler';
import { requestLogger } from './common/logger';
import { config } from './config/env';
import exportRoutes from './export/routes/exportRoutes';
import feedbackRoutes from './feedback/routes/feedbackRoutes';
import inventoryRoutes from './inventory/routes/inventoryRoutes';
import notificationRoutes from './notifications/routes/notificationRoutes';
import healthRoutes from './core/routes/healthRoutes';

const app = express();
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method),
});

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(writeLimiter);

app.use('/api/health', healthRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use(errorHandler);

export default app;
