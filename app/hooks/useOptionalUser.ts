import type { User } from '~/prisma-actions/user.server';
import { isUser } from '~/utils/isUser';
import { useMatchesData } from './useMatchesData';

export const useOptionalUser = (): User | undefined => {
  const data = useMatchesData('root');
  if (!data || !isUser(data.user)) {
    return;
  }
  return data.user;
};
