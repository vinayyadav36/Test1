import { config } from './config/env';
import { connectDB } from './config/db';
import app from './app';

async function main(): Promise<void> {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
