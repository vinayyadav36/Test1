import { Model, Schema, model } from 'mongoose';

export interface BusinessDocument {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

type BusinessModel = Model<any> & {
  createWithUniqueSlug(name: string): Promise<any>;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'business';
}

const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

businessSchema.static('createWithUniqueSlug', async function createWithUniqueSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;

  while (await this.exists({ slug })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return this.create({ name, slug });
});

export const Business = model<any>('Business', businessSchema) as BusinessModel;
