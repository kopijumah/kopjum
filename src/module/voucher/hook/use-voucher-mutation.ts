'use client';

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createVoucher, disableVoucherById, updateVoucher } from '../action';
import type { VoucherFormSchema } from '../schema';

type UseCreateVoucherResult = UseMutationResult<void, Error, VoucherFormSchema> & {
  errorMessage: string | null;
};

type UseUpdateVoucherResult = UseMutationResult<
  void,
  Error,
  { id: string; data: VoucherFormSchema }
> & {
  errorMessage: string | null;
};

type UseDisableVoucherResult = UseMutationResult<void, Error, string> & {
  errorMessage: string | null;
};

export const useCreateVoucher = (): UseCreateVoucherResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: VoucherFormSchema) => {
      await createVoucher(payload);
    },
    onSuccess: async () => {
      toast.success('Voucher created');
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create voucher');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};

export const useUpdateVoucher = (): UseUpdateVoucherResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: { id: string; data: VoucherFormSchema }) => {
      await updateVoucher(payload);
    },
    onSuccess: async () => {
      toast.success('Voucher updated');
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update voucher');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};

export const useDisableVoucher = (): UseDisableVoucherResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await disableVoucherById(id);
    },
    onSuccess: async () => {
      toast.success('Voucher disabled');
      await queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disable voucher');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};
