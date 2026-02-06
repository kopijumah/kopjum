'use client';

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createItem, disableItemById, updateItem } from '../action';
import type { ItemFormSchema } from '../schema';

type UseCreateItemResult = UseMutationResult<void, Error, ItemFormSchema> & {
  errorMessage: string | null;
};

type UseUpdateItemResult = UseMutationResult<
  void,
  Error,
  { id: string; data: ItemFormSchema }
> & {
  errorMessage: string | null;
};

type UseDisableItemResult = UseMutationResult<void, Error, string> & {
  errorMessage: string | null;
};

export const useCreateItem = (): UseCreateItemResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: ItemFormSchema) => {
      await createItem(payload);
    },
    onSuccess: async () => {
      toast.success('Item created');
      await queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create item');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};

export const useUpdateItem = (): UseUpdateItemResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (payload: { id: string; data: ItemFormSchema }) => {
      await updateItem(payload);
    },
    onSuccess: async () => {
      toast.success('Item updated');
      await queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};

export const useDisableItem = (): UseDisableItemResult => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await disableItemById(id);
    },
    onSuccess: async () => {
      toast.success('Item disabled');
      await queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disable item');
    },
  });

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return {
    ...mutation,
    errorMessage,
  };
};
