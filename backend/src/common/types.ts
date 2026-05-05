import { Request } from 'express';

export interface UserDoc {
  _id: string;
  businessId: string;
  name: string;
  email: string;
  role: 'owner' | 'staff' | 'admin';
}

export interface AuthRequest extends Request {
  user?: UserDoc;
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
