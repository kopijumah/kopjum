'use client';

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTransaction } from '../action';
import type { TransactionFormSchema } from '../schema';

type UseCreateTransactionResult = UseMutationResult<void, Error, TransactionFormSchema> & {
  errorMessage: string | null;
};

export const useCreateTransaction = (): UseCreateTransactionResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: TransactionFormSchema) => {
      await createTransaction(payload);
    },
    onSuccess: async () => {
      toast.success('Transaction created');
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create transaction');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};
