'use client'

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login } from '../action';
import type { LoginSchema } from '../schema';

type UseLoginResult = UseMutationResult<LoginSchema, Error, LoginSchema> & {
  errorMessage: string | null;
};

export const useLogin = (): UseLoginResult => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (payload: LoginSchema) => {
      await login(payload);
      return payload;
    },
    onSuccess: () => {
      toast.success('Login successful');
      router.push('/transaction');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};
