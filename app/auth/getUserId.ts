import { USER_SESSION_KEY } from './constants';
import { getSession } from './getSession';

export async function getUserId(request: Request): Promise<string | undefined> {
  const { session } = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}
