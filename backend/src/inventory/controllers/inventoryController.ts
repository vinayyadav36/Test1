import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../common/types';
import { BadRequestError, NotFoundError } from '../../common/errors';
import { Product } from '../models/Product';
import { InventoryMovement } from '../models/InventoryMovement';
import { generateRestockSuggestions } from '../services/forecastingService';

export async function createProduct(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, sku, unit, category } = req.body as Record<string, string>;
    if (!name || !sku || !unit) {
      return next(new BadRequestError('name, sku, and unit are required'));
    }
    const product = await Product.create({
      businessId: req.businessId,
      name,
      sku,
      unit,
      category,
      currentStock: 0,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

export async function listProducts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = await Product.find({ businessId: req.businessId }).lean();
    res.json({ data: products });
  } catch (err) {
    next(err);
  }
}

export async function recordMovement(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId, type, quantity, date, note } = req.body as Record<string, unknown>;
    if (!productId || !type || quantity === undefined) {
      return next(new BadRequestError('productId, type, and quantity are required'));
    }
    const product = await Product.findOne({
      _id: productId,
      businessId: req.businessId,
    });
    if (!product) {
      return next(new NotFoundError('Product not found'));
    }
    const qty = Number(quantity);
    const movement = await InventoryMovement.create({
      businessId: req.businessId,
      productId,
      type,
      quantity: qty,
      date: date ? new Date(date as string) : new Date(),
      note,
    });
    if (type === 'purchase') {
      product.currentStock += qty;
    } else if (type === 'sale') {
      product.currentStock = Math.max(0, product.currentStock - qty);
    } else {
      product.currentStock += qty;
    }
    await product.save();
    res.status(201).json(movement);
  } catch (err) {
    next(err);
  }
}

export async function getRestockSuggestions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const horizonDays = parseInt(String(req.query.horizonDays || '7'), 10);
    const safetyFactor = parseFloat(String(req.query.safetyFactor || '1.5'));
    const suggestions = await generateRestockSuggestions(req.businessId!, horizonDays, safetyFactor);
    res.json({ data: suggestions });
  } catch (err) {
    next(err);
  }
}
