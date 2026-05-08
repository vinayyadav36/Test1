import { Product } from '../../common/types';
import { collections } from '../collections';
import { addTimestamps, readCollection, updateTimestamp, writeCollection } from '../fileStore';

async function readProducts(): Promise<Product[]> {
  return readCollection<Product>(collections.products);
}

export const productRepository = {
  async listByBusinessId(businessId: string): Promise<Product[]> {
    const products = await readProducts();
    return products.filter((product) => product.businessId === businessId).sort((a, b) => a.name.localeCompare(b.name));
  },

  async findById(id: string, businessId?: string): Promise<Product | undefined> {
    const products = await readProducts();
    return products.find((product) => product.id === id && (!businessId || product.businessId === businessId));
  },

  async findBySku(businessId: string, sku: string): Promise<Product | undefined> {
    const products = await readProducts();
    return products.find((product) => product.businessId === businessId && product.sku === sku);
  },

  async create(input: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const products = await readProducts();
    const record = addTimestamps(input);
    products.push(record);
    await writeCollection(collections.products, products);
    return record;
  },

  async update(product: Product): Promise<Product> {
    const products = await readProducts();
    const index = products.findIndex((entry) => entry.id === product.id && entry.businessId === product.businessId);
    const updated = updateTimestamp(product);
    products[index] = updated;
    await writeCollection(collections.products, products);
    return updated;
  },
};
