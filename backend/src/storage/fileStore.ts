import { readFile, rename, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { BaseDocument } from '../common/types';
import { getCollectionFilePath } from './db';
import { CollectionName } from './collections';

const writeQueues = new Map<CollectionName, Promise<void>>();

export async function readCollection<T>(collectionName: CollectionName): Promise<T[]> {
  const content = await readFile(getCollectionFilePath(collectionName), 'utf8');
  return JSON.parse(content) as T[];
}

export async function writeCollection<T>(collectionName: CollectionName, documents: T[]): Promise<void> {
  const filePath = getCollectionFilePath(collectionName);
  const tempPath = `${filePath}.tmp`;
  const nextWrite = (writeQueues.get(collectionName) ?? Promise.resolve()).then(async () => {
    await writeFile(tempPath, JSON.stringify(documents, null, 2) + '\n', 'utf8');
    await rename(tempPath, filePath);
  });

  writeQueues.set(collectionName, nextWrite.catch(() => undefined));
  await nextWrite;
}

export function generateId(): string {
  return randomUUID();
}

export function addTimestamps<T extends Record<string, unknown>>(document: T): T & BaseDocument {
  const now = new Date().toISOString();
  return {
    ...document,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTimestamp<T extends BaseDocument>(document: T): T {
  return {
    ...document,
    updatedAt: new Date().toISOString(),
  };
}
