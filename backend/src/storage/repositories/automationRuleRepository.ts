import { AutomationRule } from '../../common/types';
import { collections } from '../collections';
import { addTimestamps, readCollection, writeCollection } from '../fileStore';

async function readAutomationRules(): Promise<AutomationRule[]> {
  return readCollection<AutomationRule>(collections.automationRules);
}

export const automationRuleRepository = {
  async listByBusinessId(businessId: string): Promise<AutomationRule[]> {
    const automationRules = await readAutomationRules();
    return automationRules.filter((rule) => rule.businessId === businessId);
  },

  async create(input: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
    const automationRules = await readAutomationRules();
    const record = addTimestamps(input);
    automationRules.push(record);
    await writeCollection(collections.automationRules, automationRules);
    return record;
  },
};
