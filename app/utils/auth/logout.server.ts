import { redirect } from '@remix-run/node';
import { cookieSessionStorage } from './cookiesSessionStorage.server';
import { getSession } from './getSession.server';

export async function logout(request: Request) {
  const { session } = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await cookieSessionStorage.destroySession(session),
    },
  });
}
