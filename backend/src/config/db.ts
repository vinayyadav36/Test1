import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../common/logger';

let isConnecting = false;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    return;
  }

  isConnecting = true;

  try {
    await mongoose.connect(config.mongoUri);
    logger.info('mongodb.connected', { uri: config.mongoUri });
  } catch (error) {
    logger.error('mongodb.connection_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  } finally {
    isConnecting = false;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
