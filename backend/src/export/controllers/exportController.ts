import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../common/types';
import { mapDocument, mapDocuments } from '../../common/utils';
import { AutomationRule } from '../../automation/models/AutomationRule';
import { Business } from '../../core/models/Business';
import { User } from '../../core/models/User';
import { EventLog } from '../../events/models/EventLog';
import { Feedback } from '../../feedback/models/Feedback';
import { InventoryMovement } from '../../inventory/models/InventoryMovement';
import { Product } from '../../inventory/models/Product';
import { Notification } from '../../notifications/models/Notification';
import { BusinessSettings } from '../../settings/models/BusinessSettings';
import { Task } from '../../tasks/models/Task';

export async function getFullExportHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const businessId = req.businessId!;
    const [business, users, feedback, products, inventoryMovements, events, automationRules, notifications, settings, tasks] = await Promise.all([
      Business.findById(businessId).lean() as Promise<any>,
      User.find({ businessId }).lean(),
      Feedback.find({ businessId }).sort({ createdAt: -1 }).lean(),
      Product.find({ businessId }).sort({ name: 1 }).lean(),
      InventoryMovement.find({ businessId }).sort({ date: -1 }).lean(),
      EventLog.find({ businessId }).sort({ createdAt: -1 }).lean(),
      AutomationRule.find({ businessId }).lean(),
      Notification.find({ businessId }).sort({ createdAt: -1 }).lean(),
      BusinessSettings.findOne({ businessId }).lean() as Promise<any>,
      Task.find({ businessId }).sort({ createdAt: -1 }).lean(),
    ]);

    res.json({
      data: {
        business: business ? mapDocument(business) : null,
        settings: settings ? mapDocument(settings) : null,
        users: mapDocuments(users),
        feedback: mapDocuments(feedback),
        products: mapDocuments(products),
        inventoryMovements: mapDocuments(inventoryMovements),
        events: mapDocuments(events),
        automationRules: mapDocuments(automationRules),
        notifications: mapDocuments(notifications),
        tasks: mapDocuments(tasks),
      },
    });
  } catch (error) {
    next(error);
  }
}
