import { Business } from '../../common/types';
import { slugify } from '../../common/utils';
import { collections } from '../collections';
import { addTimestamps, readCollection, writeCollection } from '../fileStore';

async function readBusinesses(): Promise<Business[]> {
  return readCollection<Business>(collections.businesses);
}

export const businessRepository = {
  async list(): Promise<Business[]> {
    return readBusinesses();
  },

  async findById(id: string): Promise<Business | undefined> {
    const businesses = await readBusinesses();
    return businesses.find((business) => business.id === id);
  },

  async findBySlug(slug: string): Promise<Business | undefined> {
    const businesses = await readBusinesses();
    return businesses.find((business) => business.slug === slug);
  },

  async create(input: { name: string; slug?: string }): Promise<Business> {
    const businesses = await readBusinesses();
    const baseSlug = input.slug ? slugify(input.slug) : slugify(input.name);
    let slug = baseSlug;
    let suffix = 2;

    while (businesses.some((business) => business.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const business = addTimestamps<Pick<Business, 'name' | 'slug'>>({
      name: input.name,
      slug,
    });

    businesses.push(business);
    await writeCollection(collections.businesses, businesses);
    return business;
  },
};
