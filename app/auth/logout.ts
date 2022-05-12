import { redirect } from '@remix-run/node';
import { cookieSessionStorage } from './cookiesSessionStorage';
import { getSession } from './getSession';

export async function logout(request: Request) {
  const { session } = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await cookieSessionStorage.destroySession(session),
    },
  });
}
