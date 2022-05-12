import { cookieSessionStorage } from './cookiesSessionStorage';

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');

  const session = await cookieSessionStorage.getSession(cookie);
  return {
    session,
  };
}
