import { getUserById } from '~/prisma-actions/user.server';
import { getUserId } from './getUserId';
import type { User } from '~/prisma-actions/user.server';
import { logout } from './logout';

export async function getUser(request: Request): Promise<null | User> {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);

  if (user) return user;

  throw await logout(request);
}
