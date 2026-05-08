import app from './app';
import { logger } from './common/logger';
import { connectDB } from './config/db';
import { config } from './config/env';

async function start(): Promise<void> {
  await connectDB();

  app.listen(config.port, () => {
    logger.info('server.started', { port: config.port, env: config.nodeEnv });
  });
}

start().catch((error) => {
  logger.error('server.start_failed', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});
