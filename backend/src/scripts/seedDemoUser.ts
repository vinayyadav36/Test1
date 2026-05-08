import { disconnectDB, connectDB } from '../config/db';
import { Business } from '../core/models/Business';
import { User } from '../core/models/User';

async function seed(): Promise<void> {
  await connectDB();

  let business = await Business.findOne({ slug: 'demo-kirana' });
  if (!business) {
    business = await Business.createWithUniqueSlug('Demo Kirana');
  }

  let user = await User.findOne({ email: 'owner@demo.local' });
  if (!user) {
    user = await User.create({
      businessId: business._id,
      name: 'Demo Owner',
      email: 'owner@demo.local',
      passwordHash: 'demo-password',
      role: 'owner',
    });
  }

  console.log(JSON.stringify({
    businessId: business._id.toString(),
    businessSlug: business.slug,
    userId: user._id.toString(),
    email: user.email,
  }, null, 2));

  await disconnectDB();
}

seed().catch(async (error) => {
  console.error(error);
  await disconnectDB();
  process.exit(1);
});
