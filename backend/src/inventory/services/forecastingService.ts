import { Types } from 'mongoose';
import { InventoryMovement } from '../models/InventoryMovement';
import { Product } from '../models/Product';
import { BusinessSettings } from '../../settings/models/BusinessSettings';

export interface RestockSuggestion {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  category?: string;
  currentStock: number;
  reorderLevel?: number;
  avgDailySales: number;
  predictedDemand: number;
  daysOfStockLeft: number | null;
  suggestedOrder: number;
  movementLabel: 'fast-moving' | 'slow-moving' | 'stable';
  severity: 'none' | 'warning' | 'critical';
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function getMovementLabel(avgDailySales: number): 'fast-moving' | 'slow-moving' | 'stable' {
  if (avgDailySales >= 5) {
    return 'fast-moving';
  }
  if (avgDailySales > 0 && avgDailySales <= 1) {
    return 'slow-moving';
  }
  return 'stable';
}

function getSeverity(daysOfStockLeft: number | null, warningDays: number, criticalDays: number): 'none' | 'warning' | 'critical' {
  if (daysOfStockLeft === null) {
    return 'none';
  }
  if (daysOfStockLeft <= criticalDays) {
    return 'critical';
  }
  if (daysOfStockLeft <= warningDays) {
    return 'warning';
  }
  return 'none';
}

async function getSalesAveragesByProduct(businessId: string, days = 30): Promise<Map<string, number>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await InventoryMovement.aggregate<{ _id: Types.ObjectId; totalSold: number }>([
    {
      $match: {
        businessId: new Types.ObjectId(businessId),
        type: 'sale',
        archived: false,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$productId',
        totalSold: { $sum: '$quantity' },
      },
    },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.totalSold / days]));
}

export async function generateRestockSuggestions(businessId: string): Promise<RestockSuggestion[]> {
  const [products, salesMap, settings] = await Promise.all([
    Product.find({ businessId, archived: false }).sort({ name: 1 }).lean() as Promise<any[]>,
    getSalesAveragesByProduct(businessId),
    BusinessSettings.findOne({ businessId }).lean() as Promise<any>,
  ]);

  const forecastHorizonDays = settings?.forecastHorizonDays ?? 7;
  const safetyFactor = settings?.safetyFactor ?? 1.2;
  const warningDays = settings?.notificationThresholds?.lowStockWarningDays ?? 7;
  const criticalDays = settings?.notificationThresholds?.lowStockCriticalDays ?? 3;

  return products.map((product) => {
    const avgDailySales = salesMap.get(String(product._id)) ?? 0;
    const predictedDemand = avgDailySales * forecastHorizonDays * safetyFactor;
    const baseline = product.reorderLevel ?? 0;
    const suggestedOrder = Math.max(0, Math.ceil(predictedDemand + baseline - product.currentStock));
    const daysOfStockLeft = avgDailySales > 0 ? round(product.currentStock / avgDailySales) : null;

    return {
      productId: String(product._id),
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      category: product.category,
      currentStock: product.currentStock,
      reorderLevel: product.reorderLevel,
      avgDailySales: round(avgDailySales),
      predictedDemand: round(predictedDemand),
      daysOfStockLeft,
      suggestedOrder,
      movementLabel: getMovementLabel(avgDailySales),
      severity: getSeverity(daysOfStockLeft, warningDays, criticalDays),
    };
  });
}

export async function getRestockSuggestionForProduct(businessId: string, productId: string): Promise<RestockSuggestion | null> {
  const suggestions = await generateRestockSuggestions(businessId);
  return suggestions.find((suggestion) => suggestion.productId === productId) ?? null;
}
