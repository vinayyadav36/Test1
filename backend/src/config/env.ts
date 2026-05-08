import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'test' | 'production';

export const config = {
  port: Number.parseInt(process.env.PORT ?? '4000', 10) || 4000,
  nodeEnv: (process.env.NODE_ENV?.trim() || 'development') as NodeEnv,
  corsOrigin: process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173',
  enableDemoAuth: process.env.ENABLE_DEMO_AUTH !== 'false',
};
