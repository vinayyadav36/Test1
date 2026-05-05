import { connectDB } from '../config/db';
import { Business } from '../core/models/Business';
import { User } from '../core/models/User';
import mongoose from 'mongoose';

async function seed(): Promise<void> {
  await connectDB();

  let business = await Business.findOne({ slug: 'demo-kirana' });
  if (!business) {
    business = await Business.create({
      name: 'Demo Kirana',
      slug: 'demo-kirana',
      ownerUserId: new mongoose.Types.ObjectId(),
    });
    console.log('Created business:', business._id.toString());
  } else {
    console.log('Business already exists:', business._id.toString());
  }

  let user = await User.findOne({ email: 'owner@demo.com' });
  if (!user) {
    user = await User.create({
      businessId: business._id,
      name: 'Demo Owner',
      email: 'owner@demo.com',
      passwordHash: '',
      role: 'owner',
    });
    console.log('Created user:', user._id.toString());
  } else {
    console.log('User already exists:', user._id.toString());
  }

  console.log('\n--- Copy these into your frontend .env or use as x-demo-user-id ---');
  console.log('BUSINESS_ID=', business._id.toString());
  console.log('USER_ID=', user._id.toString());
  console.log('x-demo-user-id:', user._id.toString());

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
