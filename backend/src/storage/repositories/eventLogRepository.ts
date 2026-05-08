import { EventLog } from '../../common/types';
import { collections } from '../collections';
import { addTimestamps, readCollection, writeCollection } from '../fileStore';

async function readEventLogs(): Promise<EventLog[]> {
  return readCollection<EventLog>(collections.eventLogs);
}

export const eventLogRepository = {
  async listByBusinessId(businessId: string): Promise<EventLog[]> {
    const eventLogs = await readEventLogs();
    return eventLogs.filter((event) => event.businessId === businessId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input: Omit<EventLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventLog> {
    const eventLogs = await readEventLogs();
    const record = addTimestamps(input);
    eventLogs.push(record);
    await writeCollection(collections.eventLogs, eventLogs);
    return record;
  },
};
