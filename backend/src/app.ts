import express from 'express';
import cors from 'cors';
import { requestLogger } from './common/logger';
import { errorHandler } from './common/errorHandler';
import healthRoutes from './core/routes/healthRoutes';
import feedbackRoutes from './feedback/routes/feedbackRoutes';
import inventoryRoutes from './inventory/routes/inventoryRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/health', healthRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/inventory', inventoryRoutes);

app.use(errorHandler);

export default app;
