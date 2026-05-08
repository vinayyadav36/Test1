import { eventLogRepository } from '../../storage/repositories/eventLogRepository';
import { notificationRepository } from '../../storage/repositories/notificationRepository';
import { generateRestockSuggestions } from '../../inventory/services/forecastingService';

export async function recordEvent(businessId: string, type: string, payload: Record<string, unknown>): Promise<void> {
  await eventLogRepository.create({
    businessId,
    type,
    payload,
  });

  if (type === 'feedback.created') {
    const rating = Number(payload.rating ?? 0);
    if (rating > 0 && rating <= 2) {
      await notificationRepository.create({
        businessId,
        type: 'feedback.negative',
        message: 'New negative feedback needs attention',
        payload: { feedbackId: payload.id },
        seen: false,
      });
    }
    return;
  }

  if (type === 'inventory.movement') {
    const productId = String(payload.productId ?? '');
    if (!productId) {
      return;
    }

    const suggestions = await generateRestockSuggestions(businessId);
    const suggestion = suggestions.find((item) => item.productId === productId);
    if (!suggestion || suggestion.suggestedOrder <= 0) {
      return;
    }

    await notificationRepository.create({
      businessId,
      type: 'inventory.restock',
      message: `Restock suggested for ${suggestion.name}`,
      payload: suggestion as unknown as Record<string, unknown>,
      seen: false,
    });
  }
}
