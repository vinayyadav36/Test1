import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'owner' | 'staff' | 'admin';

export interface AuthUser {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  businessId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type JsonRecord = Record<string, unknown>;

export interface BaseDocumentFields {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ObjectIdLike = string | Types.ObjectId;
