import { EventLog } from '../models/EventLog';
import { JsonRecord } from '../../common/types';
import { Notification } from '../../notifications/models/Notification';
import { getRestockSuggestionForProduct } from '../../inventory/services/forecastingService';
import { Product } from '../../inventory/models/Product';
import { Task } from '../../tasks/models/Task';

interface RecordedEvent {
  businessId: string;
  type: string;
  payload: JsonRecord;
  actorUserId?: string;
}

async function createNotificationIfMissing(
  businessId: string,
  type: string,
  message: string,
  payload: JsonRecord,
  actorUserId?: string,
): Promise<void> {
  const existing = await Notification.findOne({ businessId, type, 'payload.referenceId': payload.referenceId, seen: false }).lean();
  if (existing) {
    return;
  }

  await Notification.create({
    businessId,
    type,
    message,
    payload,
    seen: false,
    createdByUserId: actorUserId,
    updatedByUserId: actorUserId,
    source: 'system',
    archived: false,
  });
}

async function createTaskIfMissing(
  businessId: string,
  type: string,
  title: string,
  description: string,
  priority: 'medium' | 'high' | 'critical',
  payload: JsonRecord,
  actorUserId?: string,
): Promise<void> {
  const existing = await Task.findOne({ businessId, type, 'payload.referenceId': payload.referenceId, status: { $ne: 'done' } }).lean();
  if (existing) {
    return;
  }

  await Task.create({
    businessId,
    type,
    title,
    description,
    priority,
    payload,
    status: 'open',
    createdByUserId: actorUserId,
    updatedByUserId: actorUserId,
    source: 'system',
    archived: false,
  });
}

export async function evaluateRulesForEvent(event: RecordedEvent): Promise<void> {
  if (event.type === 'feedback.created') {
    const rating = Number(event.payload.rating ?? 0);
    if (rating > 0 && rating <= 2) {
      const payload = { referenceId: String(event.payload.id ?? ''), rating };
      await createNotificationIfMissing(event.businessId, 'feedback.negative', 'New negative feedback received', payload, event.actorUserId);
      await createTaskIfMissing(event.businessId, 'feedback.follow_up', 'Follow up on negative feedback', 'Reach out to the customer and resolve the issue.', 'high', payload, event.actorUserId);
    }
    return;
  }

  if (event.type === 'inventory.movement') {
    const productId = String(event.payload.productId ?? '');
    if (!productId) {
      return;
    }

    const product = (await Product.findOne({ _id: productId, businessId: event.businessId, archived: false }).lean()) as any;
    if (!product) {
      return;
    }

    const suggestion = await getRestockSuggestionForProduct(event.businessId, String(product._id));
    if (!suggestion || suggestion.suggestedOrder <= 0) {
      return;
    }

    const payload = {
      referenceId: String(product._id),
      productId: String(product._id),
      suggestedOrder: suggestion.suggestedOrder,
      severity: suggestion.severity,
      sku: product.sku,
    };

    await createNotificationIfMissing(event.businessId, 'inventory.restock_needed', `Restock needed for ${product.name}`, payload, event.actorUserId);
    if (suggestion.severity === 'critical') {
      await createTaskIfMissing(event.businessId, 'inventory.stock_task', `Urgent restock for ${product.name}`, 'Place a replenishment order for this critical low-stock item.', 'critical', payload, event.actorUserId);
    }
  }
}

export async function recordEvent(businessId: string, type: string, payload: JsonRecord, actorUserId?: string): Promise<void> {
  await EventLog.create({
    businessId,
    type,
    payload,
    createdByUserId: actorUserId,
    updatedByUserId: actorUserId,
    source: 'system',
    archived: false,
  });

  await evaluateRulesForEvent({ businessId, type, payload, actorUserId });
}
