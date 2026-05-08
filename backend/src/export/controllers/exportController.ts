import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../common/types';
import { businessRepository } from '../../storage/repositories/businessRepository';
import { userRepository } from '../../storage/repositories/userRepository';
import { feedbackRepository } from '../../storage/repositories/feedbackRepository';
import { productRepository } from '../../storage/repositories/productRepository';
import { inventoryMovementRepository } from '../../storage/repositories/inventoryMovementRepository';
import { eventLogRepository } from '../../storage/repositories/eventLogRepository';
import { automationRuleRepository } from '../../storage/repositories/automationRuleRepository';
import { notificationRepository } from '../../storage/repositories/notificationRepository';

export async function getFullExportHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const businessId = req.businessId!;
    const [business, users, feedback, products, inventoryMovements, events, automationRules, notifications] = await Promise.all([
      businessRepository.findById(businessId),
      userRepository.listByBusinessId(businessId),
      feedbackRepository.listByBusinessId(businessId),
      productRepository.listByBusinessId(businessId),
      inventoryMovementRepository.listByBusinessId(businessId),
      eventLogRepository.listByBusinessId(businessId),
      automationRuleRepository.listByBusinessId(businessId),
      notificationRepository.listByBusinessId(businessId),
    ]);

    res.json({
      data: {
        business: business ?? null,
        users,
        feedback,
        products,
        inventoryMovements,
        events,
        automationRules,
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
}
