import { InventoryMovement } from '../../common/types';
import { collections } from '../collections';
import { addTimestamps, readCollection, writeCollection } from '../fileStore';

async function readInventoryMovements(): Promise<InventoryMovement[]> {
  return readCollection<InventoryMovement>(collections.inventoryMovements);
}

export const inventoryMovementRepository = {
  async listByBusinessId(businessId: string): Promise<InventoryMovement[]> {
    const movements = await readInventoryMovements();
    return movements.filter((movement) => movement.businessId === businessId).sort((a, b) => b.date.localeCompare(a.date));
  },

  async listSalesByBusinessIdSince(businessId: string, since: string): Promise<InventoryMovement[]> {
    const movements = await readInventoryMovements();
    return movements.filter(
      (movement) => movement.businessId === businessId && movement.type === 'sale' && movement.date >= since,
    );
  },

  async create(input: Omit<InventoryMovement, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryMovement> {
    const movements = await readInventoryMovements();
    const record = addTimestamps(input);
    movements.push(record);
    await writeCollection(collections.inventoryMovements, movements);
    return record;
  },
};
