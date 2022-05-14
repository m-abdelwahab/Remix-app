import { getUserById } from '~/models/user.server';
import { logout } from './logout.server';
import { requireUserId } from './requireUserId.server';

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}
