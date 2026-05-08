import { NextFunction, Response } from 'express';
import { BadRequestError, NotFoundError } from '../../common/errors';
import { AuthRequest, InventoryMovementType, Product } from '../../common/types';
import { recordEvent } from '../../events/services/eventService';
import { inventoryMovementRepository } from '../../storage/repositories/inventoryMovementRepository';
import { productRepository } from '../../storage/repositories/productRepository';
import { generateRestockSuggestions } from '../services/forecastingService';

function parseQuantity(value: unknown): number {
  const quantity = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new BadRequestError('quantity must be greater than zero');
  }
  return quantity;
}

function parseMovementType(value: unknown): InventoryMovementType {
  if (value === 'sale' || value === 'purchase' || value === 'adjustment') {
    return value;
  }
  throw new BadRequestError('type must be sale, purchase, or adjustment');
}

export async function createProductHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, sku, category, unit, currentStock, reorderLevel } = req.body as Record<string, unknown>;
    if (typeof name !== 'string' || typeof sku !== 'string' || typeof unit !== 'string') {
      throw new BadRequestError('name, sku, and unit are required');
    }

    const existing = await productRepository.findBySku(req.businessId!, sku);
    if (existing) {
      throw new BadRequestError('sku must be unique within the business');
    }

    const product = await productRepository.create({
      businessId: req.businessId!,
      name,
      sku,
      category: typeof category === 'string' ? category : undefined,
      unit,
      currentStock: typeof currentStock === 'number' ? currentStock : Number(currentStock ?? 0) || 0,
      reorderLevel: typeof reorderLevel === 'number' ? reorderLevel : reorderLevel !== undefined ? Number(reorderLevel) : undefined,
    });

    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
}

export async function listProductsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await productRepository.listByBusinessId(req.businessId!);
    res.json({ data: products });
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
    const product = await productRepository.findById(productId, req.businessId!);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let nextStock = product.currentStock;
    if (movementType === 'sale') {
      nextStock -= parsedQuantity;
    } else if (movementType === 'purchase') {
      nextStock += parsedQuantity;
    } else {
      nextStock += parsedQuantity;
    }

    if (nextStock < 0) {
      throw new BadRequestError('movement would make stock negative');
    }

    const movement = await inventoryMovementRepository.create({
      businessId: req.businessId!,
      productId,
      type: movementType,
      quantity: parsedQuantity,
      date: typeof date === 'string' ? date : new Date().toISOString(),
      note: typeof note === 'string' ? note : undefined,
    });

    const updatedProduct: Product = {
      ...product,
      currentStock: nextStock,
    };
    await productRepository.update(updatedProduct);
    await recordEvent(req.businessId!, 'inventory.movement', movement);

    res.status(201).json({ data: movement });
  } catch (error) {
    next(error);
  }
}

export async function getRestockSuggestionsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const horizonDays = Math.max(1, Number.parseInt(String(req.query.horizonDays ?? '7'), 10) || 7);
    const suggestions = await generateRestockSuggestions(req.businessId!, horizonDays);
    res.json({ data: suggestions });
  } catch (error) {
    next(error);
  }
}
