import { connectDB } from '../config/db';
import { businessRepository } from '../storage/repositories/businessRepository';
import { userRepository } from '../storage/repositories/userRepository';

async function seed(): Promise<void> {
  await connectDB();

  let business = await businessRepository.findBySlug('demo-kirana');
  if (!business) {
    business = await businessRepository.create({ name: 'Demo Kirana', slug: 'demo-kirana' });
  }

  let user = await userRepository.findByEmail('owner@demo.local');
  if (!user) {
    user = await userRepository.create({
      businessId: business.id,
      name: 'Demo Owner',
      email: 'owner@demo.local',
      passwordHash: 'demo-password',
      role: 'owner',
    });
  }

  console.log(
    JSON.stringify(
      {
        businessId: business.id,
        businessSlug: business.slug,
        userId: user.id,
        email: user.email,
      },
      null,
      2,
    ),
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
