import { Notification } from '../../common/types';
import { collections } from '../collections';
import { addTimestamps, readCollection, updateTimestamp, writeCollection } from '../fileStore';

async function readNotifications(): Promise<Notification[]> {
  return readCollection<Notification>(collections.notifications);
}

export const notificationRepository = {
  async listByBusinessId(businessId: string): Promise<Notification[]> {
    const notifications = await readNotifications();
    return notifications.filter((notification) => notification.businessId === businessId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async findById(id: string, businessId: string): Promise<Notification | undefined> {
    const notifications = await readNotifications();
    return notifications.find((notification) => notification.id === id && notification.businessId === businessId);
  },

  async create(input: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const notifications = await readNotifications();
    const record = addTimestamps(input);
    notifications.push(record);
    await writeCollection(collections.notifications, notifications);
    return record;
  },

  async update(notification: Notification): Promise<Notification> {
    const notifications = await readNotifications();
    const index = notifications.findIndex((entry) => entry.id === notification.id && entry.businessId === notification.businessId);
    const updated = updateTimestamp(notification);
    notifications[index] = updated;
    await writeCollection(collections.notifications, notifications);
    return updated;
  },
};
