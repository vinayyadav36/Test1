import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../common/types';
import { mapDocuments } from '../../common/utils';
import { Task } from '../../tasks/models/Task';
import { Feedback } from '../../feedback/models/Feedback';
import { Notification } from '../../notifications/models/Notification';
import { Product } from '../../inventory/models/Product';
import { InventoryMovement } from '../../inventory/models/InventoryMovement';
import { generateRestockSuggestions } from '../../inventory/services/forecastingService';

export async function getDashboardSummaryHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const businessId = req.businessId!;
    const since = new Date();
    since.setDate(since.getDate() - 14);

    const [feedbackCount, openFeedback, notifications, tasks, products, recentMovements, restock] = await Promise.all([
      Feedback.countDocuments({ businessId, archived: false }),
      Feedback.find({ businessId, archived: false, status: { $ne: 'resolved' } }).sort({ createdAt: -1 }).limit(5).lean(),
      Notification.find({ businessId, seen: false, archived: false }).sort({ createdAt: -1 }).limit(5).lean(),
      Task.find({ businessId, status: { $ne: 'done' }, archived: false }).sort({ priority: -1, createdAt: -1 }).limit(8).lean(),
      Product.find({ businessId, archived: false }).lean(),
      InventoryMovement.find({ businessId, date: { $gte: since }, archived: false }).lean(),
      generateRestockSuggestions(businessId),
    ]);

    const productMovementMap = new Map<string, number>();
    recentMovements.forEach((movement: any) => {
      productMovementMap.set(String(movement.productId), (productMovementMap.get(String(movement.productId)) ?? 0) + 1);
    });

    const lowStockProducts = restock.filter((item) => item.suggestedOrder > 0).slice(0, 5);
    const productsWithoutMovement = products.filter((product: any) => !productMovementMap.has(String(product._id))).slice(0, 5);

    res.json({
      data: {
        totals: {
          feedback: feedbackCount,
          openTasks: tasks.length,
          unseenNotifications: notifications.length,
          lowStockProducts: lowStockProducts.length,
        },
        actionCenter: {
          negativeFeedback: mapDocuments(openFeedback),
          lowStockProducts,
          productsWithoutMovement: mapDocuments(productsWithoutMovement),
          unseenNotifications: mapDocuments(notifications),
          openTasks: mapDocuments(tasks),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
