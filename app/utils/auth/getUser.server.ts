import { getUserById } from '~/models/user.server';
import { getUserId } from './getUserId.server';
import type { User } from '~/models/user.server';
import { logout } from './logout.server';

export async function getUser(request: Request): Promise<null | User> {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);

  if (user) return user;

  throw await logout(request);
}
