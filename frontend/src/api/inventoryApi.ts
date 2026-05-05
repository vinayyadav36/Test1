import client from './client';

export interface ProductPayload {
  name: string;
  sku: string;
  unit: string;
  category?: string;
}

export interface Product {
  _id: string;
  businessId: string;
  name: string;
  sku: string;
  unit: string;
  category?: string;
  currentStock: number;
  reorderLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MovementPayload {
  productId: string;
  type: 'sale' | 'purchase' | 'adjustment';
  quantity: number;
  date?: string;
  note?: string;
}

export interface RestockSuggestion {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  avgDailySales: number;
  predictedDemand: number;
  suggestedOrder: number;
}

export interface RestockResponse {
  data: RestockSuggestion[];
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data } = await client.post<Product>('/api/inventory/products', payload);
  return data;
}

export async function fetchProducts(): Promise<{ data: Product[] }> {
  const { data } = await client.get<{ data: Product[] }>('/api/inventory/products');
  return data;
}

export async function recordMovement(payload: MovementPayload): Promise<unknown> {
  const { data } = await client.post('/api/inventory/movements', payload);
  return data;
}

export async function fetchRestockSuggestions(params?: {
  horizonDays?: number;
  safetyFactor?: number;
}): Promise<RestockResponse> {
  const { data } = await client.get<RestockResponse>('/api/inventory/restock', { params });
  return data;
}
