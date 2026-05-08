import { InventoryMovement } from '../models/InventoryMovement';
import { Product } from '../models/Product';
import { mapDocuments } from '../../common/utils';

export interface RestockSuggestion {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  currentStock: number;
  reorderLevel?: number;
  avgDailySales: number;
  predictedDemand: number;
  suggestedOrder: number;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

async function getSalesAveragesByProduct(businessId: string, days = 30): Promise<Map<string, number>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await InventoryMovement.aggregate<{ _id: string; totalSold: number }>([
    {
      $match: {
        businessId: InventoryMovement.db.base.Types.ObjectId.createFromHexString(businessId),
        type: 'sale',
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

export async function generateRestockSuggestions(businessId: string, horizonDays = 7): Promise<RestockSuggestion[]> {
  const [products, salesMap] = await Promise.all([
    Product.find({ businessId }).sort({ name: 1 }).lean(),
    getSalesAveragesByProduct(businessId),
  ]);

  return products.map((product) => {
    const avgDailySales = salesMap.get(String(product._id)) ?? 0;
    const predictedDemand = avgDailySales * horizonDays;
    const baseline = product.reorderLevel ?? 0;
    const suggestedOrder = Math.max(0, Math.ceil(predictedDemand + baseline - product.currentStock));

    return {
      productId: String(product._id),
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      currentStock: product.currentStock,
      reorderLevel: product.reorderLevel,
      avgDailySales: round(avgDailySales),
      predictedDemand: round(predictedDemand),
      suggestedOrder,
    };
  });
}

export async function getRestockSuggestionForProduct(
  businessId: string,
  productId: string,
  horizonDays = 7,
): Promise<RestockSuggestion | null> {
  const suggestions = await generateRestockSuggestions(businessId, horizonDays);
  return suggestions.find((suggestion) => suggestion.productId === productId) ?? null;
}
