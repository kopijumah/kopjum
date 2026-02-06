'use client';

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createTransaction,
  toggleTransactionStatusById,
  updateTransactionById,
} from '../action';
import type { TransactionFormSchema } from '../schema';
import { TransactionStatus } from '../enum';

type UseCreateTransactionResult = UseMutationResult<void, Error, TransactionFormSchema> & {
  errorMessage: string | null;
};

type UpdateTransactionPayload = {
  id: string;
  payload: TransactionFormSchema;
};

type UseUpdateTransactionResult = UseMutationResult<void, Error, UpdateTransactionPayload> & {
  errorMessage: string | null;
};

type ToggleStatusPayload = {
  id: string;
  currentStatus: TransactionStatus;
};

type UseToggleTransactionStatusResult = UseMutationResult<
  void,
  Error,
  ToggleStatusPayload
> & {
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

export const useUpdateTransaction = (): UseUpdateTransactionResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, payload }: UpdateTransactionPayload) => {
      await updateTransactionById(id, payload);
    },
    onSuccess: async () => {
      toast.success('Transaction updated');
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update transaction');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};

export const useToggleTransactionStatus = (): UseToggleTransactionStatusResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id, currentStatus }: ToggleStatusPayload) => {
      await toggleTransactionStatusById(id, currentStatus);
    },
    onSuccess: async (_data, variables) => {
      const nextStatus =
        variables.currentStatus === TransactionStatus.OpenBill
          ? TransactionStatus.CloseBill
          : TransactionStatus.OpenBill;
      toast.success(
        nextStatus === TransactionStatus.CloseBill
          ? 'Transaction closed'
          : 'Transaction reopened',
      );
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update transaction status');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};
