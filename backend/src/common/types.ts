import { Request } from 'express';

export type UserRole = 'owner' | 'staff' | 'admin';
export type InventoryMovementType = 'sale' | 'purchase' | 'adjustment';
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

export interface BaseDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDocument extends BaseDocument {
  businessId: string;
}

export interface Business extends BaseDocument {
  name: string;
  slug: string;
}

export interface User extends TenantDocument {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface Feedback extends TenantDocument {
  customerPhone?: string;
  rating?: number;
  transcript?: string;
  sentiment?: FeedbackSentiment;
  serviceType?: string;
  staffName?: string;
  audioUrl?: string;
}

export interface Product extends TenantDocument {
  name: string;
  sku: string;
  category?: string;
  unit: string;
  currentStock: number;
  reorderLevel?: number;
}

export interface InventoryMovement extends TenantDocument {
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  date: string;
  note?: string;
}

export interface EventLog extends TenantDocument {
  type: string;
  payload: Record<string, unknown>;
}

export interface AutomationRule extends TenantDocument {
  name: string;
  triggerType: string;
  conditions: Record<string, unknown>;
  actionType: string;
  actionPayload: Record<string, unknown>;
  enabled: boolean;
}

export interface Notification extends TenantDocument {
  type: string;
  message: string;
  payload?: Record<string, unknown>;
  seen: boolean;
}

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
