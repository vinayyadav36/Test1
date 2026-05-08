import { NextFunction, Response } from 'express';
import { BadRequestError, NotFoundError } from '../../common/errors';
import { AuthRequest } from '../../common/types';
import { mapDocument, mapDocuments, normalizeDocument } from '../../common/utils';
import { recordEvent } from '../../events/services/eventService';
import { InventoryMovement, InventoryMovementType } from '../models/InventoryMovement';
import { Product } from '../models/Product';
import { generateRestockSuggestions } from '../services/forecastingService';

function parseQuantity(value: unknown): number {
  const quantity = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(quantity) || quantity === 0) {
    throw new BadRequestError('quantity must be a non-zero number');
  }

  return quantity;
}

function parseMovementType(value: unknown): InventoryMovementType {
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
    });

    res.status(201).json({ data: mapDocument(normalizeDocument(product)) });
  } catch (error) {
    next(error);
  }
}

export async function listProductsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const products = await Product.find({ businessId: req.businessId }).sort({ name: 1 }).lean();
    res.json({ data: mapDocuments(products) });
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
    const product = await Product.findOne({ _id: productId, businessId: req.businessId });

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
    });

    product.currentStock = nextStock;
    await product.save();

    const mappedMovement = mapDocument(normalizeDocument(movement));
    await recordEvent(req.businessId!, 'inventory.movement', {
      ...mappedMovement,
      productId: String(product._id),
      currentStock: product.currentStock,
    });

    res.status(201).json({ data: mappedMovement });
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
