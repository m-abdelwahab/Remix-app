import type { User } from '~/models/user.server';

export const validateEmail = (email: string) => {
  return typeof email === 'string' && email.length > 3 && email.includes('@');
};

export const validatePassword = (password: string) => {
  if (!password) {
    return {
      error: 'Password is required',
    };
  }

  if (typeof password !== 'string') {
    return {
      error: 'Password is required',
    };
  }

  if (password.length < 8) {
    return {
      error: 'Password is too short',
    };
  }

  return true;
};

export const isUser = (user: User) => {
  return user && typeof user === 'object' && typeof user.email === 'string';
};
