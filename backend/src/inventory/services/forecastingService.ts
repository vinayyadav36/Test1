import { inventoryMovementRepository } from '../../storage/repositories/inventoryMovementRepository';
import { productRepository } from '../../storage/repositories/productRepository';

export interface RestockSuggestion {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  avgDailySales: number;
  predictedDemand: number;
  suggestedOrder: number;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function generateRestockSuggestions(businessId: string, horizonDays = 7, lookbackDays = 30): Promise<RestockSuggestion[]> {
  const products = await productRepository.listByBusinessId(businessId);
  const since = new Date();
  since.setDate(since.getDate() - lookbackDays);

  const sales = await inventoryMovementRepository.listSalesByBusinessIdSince(businessId, since.toISOString());
  const soldByProduct = new Map<string, number>();

  for (const sale of sales) {
    soldByProduct.set(sale.productId, (soldByProduct.get(sale.productId) ?? 0) + sale.quantity);
  }

  return products.map((product) => {
    const avgDailySales = (soldByProduct.get(product.id) ?? 0) / lookbackDays;
    const predictedDemand = avgDailySales * horizonDays;
    const targetStock = Math.max(predictedDemand, product.reorderLevel ?? 0);
    const suggestedOrder = Math.max(0, Math.ceil(targetStock - product.currentStock));

    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      currentStock: product.currentStock,
      avgDailySales: round(avgDailySales),
      predictedDemand: round(predictedDemand),
      suggestedOrder,
    };
  });
}
