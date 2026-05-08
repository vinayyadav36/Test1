import { User, UserRole } from '../../common/types';
import { collections } from '../collections';
import { addTimestamps, readCollection, writeCollection } from '../fileStore';

async function readUsers(): Promise<User[]> {
  return readCollection<User>(collections.users);
}

export const userRepository = {
  async listByBusinessId(businessId: string): Promise<User[]> {
    const users = await readUsers();
    return users.filter((user) => user.businessId === businessId);
  },

  async findById(id: string): Promise<User | undefined> {
    const users = await readUsers();
    return users.find((user) => user.id === id);
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await readUsers();
    return users.find((user) => user.email === email.toLowerCase());
  },

  async create(input: { businessId: string; name: string; email: string; passwordHash: string; role: UserRole }): Promise<User> {
    const users = await readUsers();
    const user = addTimestamps<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
      businessId: input.businessId,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
    });

    users.push(user);
    await writeCollection(collections.users, users);
    return user;
  },
};
