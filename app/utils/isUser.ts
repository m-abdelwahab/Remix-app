import type { User } from '~/prisma-actions/user.server';

export const isUser = (user: User) => {
  return user && typeof user === 'object' && typeof user.email === 'string';
};
