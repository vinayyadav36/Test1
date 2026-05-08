import { disconnectDB, connectDB } from '../config/db';
import { Business } from '../core/models/Business';
import { User } from '../core/models/User';
import { BusinessSettings } from '../settings/models/BusinessSettings';
import { Product } from '../inventory/models/Product';
import { InventoryMovement } from '../inventory/models/InventoryMovement';
import { Feedback } from '../feedback/models/Feedback';

async function ensureBusinessDataset(name: string, email: string, businessType: string, products: Array<Record<string, any>>, feedbackEntries: Array<Record<string, any>>): Promise<any> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let business = await Business.findOne({ slug });
  if (!business) {
    business = await Business.createWithUniqueSlug(name);
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      businessId: business._id,
      name: `${name} Owner`,
      email,
      passwordHash: 'demo-password',
      role: 'owner',
    });
  }

  await BusinessSettings.findOneAndUpdate(
    { businessId: business._id },
    {
      businessId: business._id,
      businessType,
      forecastHorizonDays: 7,
      safetyFactor: 1.2,
      preferredUnits: ['pcs', 'kg', 'ltr'],
      notificationThresholds: { lowStockWarningDays: 7, lowStockCriticalDays: 3 },
      createdByUserId: user._id,
      updatedByUserId: user._id,
      source: 'system',
      archived: false,
    },
    { upsert: true, new: true },
  );

  if ((await Product.countDocuments({ businessId: business._id })) === 0) {
    for (const productInput of products) {
      const product = await Product.create({
        businessId: business._id,
        ...productInput,
        createdByUserId: user._id,
        updatedByUserId: user._id,
        source: 'system',
        archived: false,
      });

      await InventoryMovement.create({
        businessId: business._id,
        productId: product._id,
        type: 'purchase',
        quantity: product.currentStock,
        date: new Date(),
        note: 'Seed opening stock',
        createdByUserId: user._id,
        updatedByUserId: user._id,
        source: 'system',
        archived: false,
      });
    }
  }

  if ((await Feedback.countDocuments({ businessId: business._id })) === 0) {
    for (const entry of feedbackEntries) {
      await Feedback.create({
        businessId: business._id,
        ...entry,
        createdByUserId: user._id,
        updatedByUserId: user._id,
        source: 'system',
        archived: false,
      });
    }
  }

  return { business, user };
}

async function seed(): Promise<void> {
  await connectDB();

  const kirana = await ensureBusinessDataset(
    'Demo Kirana',
    'owner@demo.local',
    'kirana',
    [
      { name: 'Rice Bag', sku: 'KIR-RICE-10', unit: 'kg', category: 'Grains', currentStock: 12, reorderLevel: 20 },
      { name: 'Cooking Oil', sku: 'KIR-OIL-1L', unit: 'ltr', category: 'Essentials', currentStock: 4, reorderLevel: 10 },
      { name: 'Tea Pack', sku: 'KIR-TEA-250', unit: 'pcs', category: 'Beverages', currentStock: 18, reorderLevel: 12 },
    ],
    [
      { rating: 2, transcript: 'Oil stock was not available again.', sentiment: 'negative', serviceType: 'Walk-in', staffName: 'Ravi', status: 'open' },
      { rating: 5, transcript: 'Quick billing and polite service.', sentiment: 'positive', serviceType: 'Walk-in', staffName: 'Pooja', status: 'resolved' },
    ],
  );

  const services = await ensureBusinessDataset(
    'Demo Service Studio',
    'owner-service@demo.local',
    'service',
    [
      { name: 'Shampoo Bottle', sku: 'SRV-SHAMPOO', unit: 'pcs', category: 'Supplies', currentStock: 8, reorderLevel: 6 },
      { name: 'Hair Serum', sku: 'SRV-SERUM', unit: 'pcs', category: 'Supplies', currentStock: 2, reorderLevel: 5 },
    ],
    [
      { rating: 1, transcript: 'Had to wait too long for the appointment.', sentiment: 'negative', serviceType: 'Salon', staffName: 'Anita', status: 'open' },
      { rating: 4, transcript: 'Great service and clean space.', sentiment: 'positive', serviceType: 'Salon', staffName: 'Nisha', status: 'reviewed' },
    ],
  );

  console.log(JSON.stringify({
    demoUsers: [
      {
        businessId: kirana.business._id.toString(),
        businessSlug: kirana.business.slug,
        userId: kirana.user._id.toString(),
        email: kirana.user.email,
      },
      {
        businessId: services.business._id.toString(),
        businessSlug: services.business.slug,
        userId: services.user._id.toString(),
        email: services.user.email,
      },
    ],
  }, null, 2));

  await disconnectDB();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDB();
  process.exit(1);
});
