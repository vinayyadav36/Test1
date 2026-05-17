import { mkdir, access, writeFile } from 'fs/promises';
import path from 'path';
import { collectionNames, CollectionName } from './collections';
import { readCollection, writeCollection, generateId } from './fileStore';

const dataDirectory = path.resolve(__dirname, '../../data');

export function getDataDirectory(): string {
  return dataDirectory;
}

function getCollectionPath(collectionName: CollectionName): string {
  return path.join(dataDirectory, `${collectionName}.json`);
}

export async function initializeDatabase(): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });

  await Promise.all(
    collectionNames.map(async (collectionName) => {
      const filePath = getCollectionPath(collectionName);
      try {
        await access(filePath);
      } catch {
        await writeFile(filePath, '[]\n', 'utf8');
      }
    }),
  );

  const users = await readCollection<{ id: string; businessId: string; email: string }>('users');
  if (users.length > 0) {
    return;
  }

  const businessId = generateId();
  const userId = generateId();
  const now = new Date().toISOString();

  const business = { id: businessId, name: 'Default Business', slug: 'default-business', createdAt: now, updatedAt: now };
  const user = {
    id: userId,
    businessId,
    name: 'Admin',
    email: 'admin@local',
    passwordHash: '',
    role: 'admin' as const,
    createdAt: now,
    updatedAt: now,
  };

  await Promise.all([
    writeCollection('businesses', [business]),
    writeCollection('users', [user]),
  ]);

  console.log(JSON.stringify({ businessId, userId, email: user.email }));
}

export function getCollectionFilePath(collectionName: CollectionName): string {
  return getCollectionPath(collectionName);
}
