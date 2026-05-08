import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'test' | 'production';

function requireEnv(name: 'MONGO_URI'): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const nodeEnv = (process.env.NODE_ENV?.trim() || 'development') as NodeEnv;

export const config = {
  port: Number.parseInt(process.env.PORT ?? '4000', 10) || 4000,
  mongoUri: requireEnv('MONGO_URI'),
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173',
};
