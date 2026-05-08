import { EventLog } from '../models/EventLog';
import { JsonRecord } from '../../common/types';
import { Notification } from '../../notifications/models/Notification';
import { getRestockSuggestionForProduct } from '../../inventory/services/forecastingService';
import { Product } from '../../inventory/models/Product';

interface RecordedEvent {
  businessId: string;
  type: string;
  payload: JsonRecord;
}

async function createNotificationIfMissing(
  businessId: string,
  type: string,
  message: string,
  payload?: JsonRecord,
): Promise<void> {
  const existing = await Notification.findOne({ businessId, type, seen: false, payload }).lean();

  if (existing) {
    return;
  }

  await Notification.create({
    businessId,
    type,
    message,
    payload,
    seen: false,
  });
}

export async function evaluateRulesForEvent(event: RecordedEvent): Promise<void> {
  if (event.type === 'feedback.created') {
    const rating = Number(event.payload.rating ?? 0);

    if (rating > 0 && rating <= 2) {
      await createNotificationIfMissing(event.businessId, 'feedback.negative', 'New negative feedback received', {
        feedbackId: String(event.payload.id ?? event.payload._id ?? ''),
        rating,
      });
    }

    return;
  }

  if (event.type === 'inventory.movement') {
    const productId = String(event.payload.productId ?? '');

    if (!productId) {
      return;
    }

    const product = await Product.findOne({ _id: productId, businessId: event.businessId }).lean();
    if (!product) {
      return;
    }

    const suggestion = await getRestockSuggestionForProduct(event.businessId, String(product._id));
    if (!suggestion || suggestion.suggestedOrder <= 0) {
      return;
    }

    await createNotificationIfMissing(event.businessId, 'inventory.restock_needed', `Restock needed for ${product.name}`, {
      productId: String(product._id),
      suggestedOrder: suggestion.suggestedOrder,
      sku: product.sku,
    });
  }
}

export async function recordEvent(businessId: string, type: string, payload: JsonRecord): Promise<void> {
  await EventLog.create({
    businessId,
    type,
    payload,
  });

  await evaluateRulesForEvent({ businessId, type, payload });
}
