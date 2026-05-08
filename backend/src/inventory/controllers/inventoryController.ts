import { NextFunction, Response } from 'express';
import { BadRequestError, NotFoundError } from '../../common/errors';
import { AuthRequest } from '../../common/types';
import { mapDocument, mapDocuments, normalizeDocument } from '../../common/utils';
import { recordEvent } from '../../events/services/eventService';
import { InventoryMovement } from '../models/InventoryMovement';
import { Product } from '../models/Product';
import { generateRestockSuggestions } from '../services/forecastingService';

function parseQuantity(value: unknown): number {
  const quantity = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(quantity) || quantity === 0) {
    throw new BadRequestError('quantity must be a non-zero number');
  }
  return quantity;
}

function parseMovementType(value: unknown): 'sale' | 'purchase' | 'adjustment' {
  if (value === 'sale' || value === 'purchase' || value === 'adjustment') {
    return value;
  }
  throw new BadRequestError('type must be one of sale, purchase, or adjustment');
}

export async function createProductHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, sku, category, unit, currentStock, reorderLevel } = req.body as Record<string, unknown>;
    if (typeof name !== 'string' || typeof sku !== 'string' || typeof unit !== 'string') {
      throw new BadRequestError('name, sku, and unit are required');
    }

    const product = await Product.create({
      businessId: req.businessId,
      name,
      sku,
      category: typeof category === 'string' ? category : undefined,
      unit,
      currentStock: typeof currentStock === 'number' ? currentStock : Number(currentStock ?? 0) || 0,
      reorderLevel: typeof reorderLevel === 'number' ? reorderLevel : reorderLevel !== undefined ? Number(reorderLevel) : undefined,
      createdByUserId: req.user?.id,
      updatedByUserId: req.user?.id,
      source: 'manual',
      archived: false,
    });

    res.status(201).json({ data: mapDocument(normalizeDocument(product)) });
  } catch (error) {
    next(error);
  }
}

export async function listProductsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: Record<string, unknown> = { businessId: req.businessId, archived: false };
    if (typeof req.query.category === 'string') {
      query.category = req.query.category;
    }

    const products = await Product.find(query).sort({ name: 1 }).lean();
    const suggestions = await generateRestockSuggestions(req.businessId!);
    const suggestionMap = new Map(suggestions.map((item) => [item.productId, item]));

    const filteredProducts = mapDocuments(products)
      .map((product: any) => ({ ...product, insight: suggestionMap.get(product.id) ?? null }))
      .filter((product: any) => {
        if (typeof req.query.stockCondition !== 'string' || !product.insight) {
          return true;
        }
        if (req.query.stockCondition === 'low') {
          return product.insight.suggestedOrder > 0;
        }
        return product.insight.severity === req.query.stockCondition;
      });

    res.json({ data: filteredProducts });
  } catch (error) {
    next(error);
  }
}

export async function recordMovementHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId, type, quantity, date, note } = req.body as Record<string, unknown>;
    if (typeof productId !== 'string') {
      throw new BadRequestError('productId is required');
    }

    const movementType = parseMovementType(type);
    const parsedQuantity = parseQuantity(quantity);
    const product = await Product.findOne({ _id: productId, businessId: req.businessId, archived: false });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const signedQuantity = movementType === 'sale' ? -Math.abs(parsedQuantity) : movementType === 'purchase' ? Math.abs(parsedQuantity) : parsedQuantity;
    const nextStock = product.currentStock + signedQuantity;
    if (nextStock < 0) {
      throw new BadRequestError('movement would make stock negative');
    }

    const movement = await InventoryMovement.create({
      businessId: req.businessId,
      productId: product._id,
      type: movementType,
      quantity: Math.abs(parsedQuantity),
      date: typeof date === 'string' ? new Date(date) : new Date(),
      note: typeof note === 'string' ? note : undefined,
      createdByUserId: req.user?.id,
      updatedByUserId: req.user?.id,
      source: 'manual',
      archived: false,
    });

    product.currentStock = nextStock;
    product.updatedByUserId = req.user?.id;
    await product.save();

    const mappedMovement = mapDocument(normalizeDocument(movement));
    await recordEvent(req.businessId!, 'inventory.movement', {
      ...mappedMovement,
      productId: String(product._id),
      currentStock: product.currentStock,
    }, req.user?.id);

    res.status(201).json({ data: mappedMovement });
  } catch (error) {
    next(error);
  }
}

export async function getRestockSuggestionsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const suggestions = await generateRestockSuggestions(req.businessId!);
    res.json({ data: suggestions });
  } catch (error) {
    next(error);
  }
}
