import mongoose from 'mongoose';
import { InventoryMovement } from '../models/InventoryMovement';
import { Product } from '../models/Product';

export interface RestockSuggestion {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  avgDailySales: number;
  predictedDemand: number;
  suggestedOrder: number;
}

export async function calculateMovingAverage(
  productId: string,
  daysWindow: number
): Promise<number> {
  const since = new Date();
  since.setDate(since.getDate() - daysWindow);

  const movements = await InventoryMovement.find({
    productId: new mongoose.Types.ObjectId(productId),
    type: 'sale',
    date: { $gte: since },
  }).lean();

  const totalSold = movements.reduce((sum, m) => sum + m.quantity, 0);
  return totalSold / daysWindow;
}

export async function generateRestockSuggestions(
  businessId: string,
  horizonDays: number = 7,
  safetyFactor: number = 1.5
): Promise<RestockSuggestion[]> {
  const products = await Product.find({ businessId }).lean();
  const suggestions: RestockSuggestion[] = [];

  for (const product of products) {
    const avgDailySales = await calculateMovingAverage(String(product._id), 30);
    const predictedDemand = avgDailySales * horizonDays;
    const safetyStock = avgDailySales * safetyFactor;
    const suggestedOrder = Math.max(0, predictedDemand + safetyStock - product.currentStock);

    if (suggestedOrder > 0) {
      suggestions.push({
        productId: String(product._id),
        name: product.name,
        sku: product.sku,
        currentStock: product.currentStock,
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        predictedDemand: Math.round(predictedDemand * 100) / 100,
        suggestedOrder: Math.round(suggestedOrder * 100) / 100,
      });
    }
  }

  return suggestions;
}
