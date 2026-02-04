'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getCurrent } from '../action';
import { User } from '~/shared/db/schema';

type AuthUser = Pick<User, 'id' | 'username' | 'role'>;

type UseAuthResult = UseQueryResult<AuthUser, Error> & {
  user: AuthUser | null;
  isAuthenticated: boolean;
};

export const useAuth = (): UseAuthResult => {
  const query = useQuery({
    queryKey: ['auth', 'current'],
    queryFn: async () => getCurrent(),
    retry: false,
  });

  const user = query.data ?? null;

  return {
    ...query,
    user,
    isAuthenticated: Boolean(user),
  };
};
 
