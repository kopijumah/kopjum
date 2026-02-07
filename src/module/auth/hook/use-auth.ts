'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { getCurrent, logout } from '../action';
import { User } from '~/shared/db/schema';

type AuthUser = Pick<User, 'id' | 'username' | 'role'>;

type UseAuthResult = UseQueryResult<AuthUser, Error> & {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export const useAuth = (): UseAuthResult => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['auth', 'current'],
    queryFn: async () => getCurrent(),
    retry: false,
  });
  const logoutMutation = useMutation({
    mutationFn: async () => logout(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'current'] });
    },
  });

  const user = query.data ?? null;

  return {
    ...query,
    user,
    isAuthenticated: Boolean(user),
    logoutMutation,
  };
};
 
