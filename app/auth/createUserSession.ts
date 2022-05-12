import { redirect } from '@remix-run/node';
import { USER_SESSION_KEY } from './constants';
import { cookieSessionStorage } from './cookiesSessionStorage';
import { getSession } from './getSession';

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const { session } = await getSession(request);
  session.set(USER_SESSION_KEY, userId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await cookieSessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}
