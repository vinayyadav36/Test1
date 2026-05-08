import { mkdir, access, writeFile } from 'fs/promises';
import path from 'path';
import { collectionNames, CollectionName } from './collections';

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
}

export function getCollectionFilePath(collectionName: CollectionName): string {
  return getCollectionPath(collectionName);
}
