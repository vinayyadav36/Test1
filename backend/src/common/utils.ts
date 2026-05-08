import { Document, Types } from 'mongoose';
import { PaginationParams } from './types';

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(query.limit ?? '20'), 10) || 20));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function toObjectId(value: string): Types.ObjectId {
  return new Types.ObjectId(value);
}

export function isObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

export function mapDocument<T extends { _id: Types.ObjectId | string }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: String(_id),
  };
}

export function mapDocuments<T extends { _id: Types.ObjectId | string }>(docs: T[]): Array<Omit<T, '_id'> & { id: string }> {
  return docs.map((doc) => mapDocument(doc));
}

export function normalizeDocument<T>(doc: T & Partial<Document>): T {
  const maybeDocument = doc as Partial<Document>;
  if (maybeDocument.toObject) {
    return maybeDocument.toObject() as T;
  }

  return doc;
}
