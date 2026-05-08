export const collections = {
  businesses: 'businesses',
  users: 'users',
  feedback: 'feedback',
  products: 'products',
  inventoryMovements: 'inventoryMovements',
  eventLogs: 'eventLogs',
  automationRules: 'automationRules',
  notifications: 'notifications',
} as const;

export type CollectionName = (typeof collections)[keyof typeof collections];

export const collectionNames: CollectionName[] = Object.values(collections);
