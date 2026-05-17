import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import { userRepository } from '../../storage/repositories/userRepository';

const router = Router();

router.get('/', getHealth);

router.get('/first-user', async (_req, res, next) => {
  try {
    const user = await userRepository.findFirst();
    res.json({ data: user ? { userId: user.id } : null });
  } catch (error) {
    next(error);
  }
});

export default router;
