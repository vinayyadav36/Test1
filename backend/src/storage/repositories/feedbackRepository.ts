import { Feedback } from '../../common/types';
import { collections } from '../collections';
import { addTimestamps, readCollection, updateTimestamp, writeCollection } from '../fileStore';

async function readFeedback(): Promise<Feedback[]> {
  return readCollection<Feedback>(collections.feedback);
}

export const feedbackRepository = {
  async listByBusinessId(businessId: string, filters?: { rating?: number }): Promise<Feedback[]> {
    const feedback = await readFeedback();
    return feedback
      .filter((entry) => entry.businessId === businessId)
      .filter((entry) => (filters?.rating !== undefined ? entry.rating === filters.rating : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async create(input: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback> {
    const feedback = await readFeedback();
    const record = addTimestamps(input);
    feedback.push(record);
    await writeCollection(collections.feedback, feedback);
    return record;
  },

  async update(id: string, businessId: string, updates: Partial<Feedback>): Promise<Feedback | undefined> {
    const feedback = await readFeedback();
    const index = feedback.findIndex((entry) => entry.id === id && entry.businessId === businessId);
    if (index === -1) {
      return undefined;
    }

    const updated = updateTimestamp({ ...feedback[index], ...updates, id: feedback[index].id, businessId: feedback[index].businessId });
    feedback[index] = updated;
    await writeCollection(collections.feedback, feedback);
    return updated;
  },
};
