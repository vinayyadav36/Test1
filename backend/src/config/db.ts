import { initializeDatabase } from '../storage/db';

export async function connectDB(): Promise<void> {
  await initializeDatabase();
}

export async function disconnectDB(): Promise<void> {
  return Promise.resolve();
}
