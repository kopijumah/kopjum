'use client';

import * as React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from '~/shared/ui/alert-dialog';
import { Button } from '~/shared/ui/button';
import { useUpdateTransaction } from '../hook/use-transaction-mutation';
import { PaymentMethod, TransactionStatus } from '../enum';
import { getItems } from '~/module/menu/action';
import { getVouchers } from '~/module/voucher/action';
import { getTransactionById } from '../action';
import { useAuth } from '~/module/auth/hook/use-auth';
import { Role } from '~/shared/enum';
import type { TransactionFormValues } from '../type';
import TransactionUpdateForm from './transaction-update-form';

type TransactionUpdateProps = {
  transactionId: string;
  trigger?: React.ReactNode;
};

const TransactionUpdate = ({ transactionId, trigger }: TransactionUpdateProps) => {
  const [open, setOpen] = React.useState(false);
  const [itemPickerOpen, setItemPickerOpen] = React.useState(false);
  const updateTransaction = useUpdateTransaction();
  const { user } = useAuth();
  const isAdmin = user?.role === Role.ADMIN;

  const defaultValues = React.useMemo<TransactionFormValues>(
    () => ({
      customer: '',
      method: PaymentMethod.Qris,
      voucherId: '',
      items: [],
    }),
    [],
  );

  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
    keyName: 'fieldKey',
  });

  const itemsQuery = useQuery({
    queryKey: ['items', 'active'],
    queryFn: async () => getItems({ isActive: true }),
    enabled: open,
  });

  const vouchersQuery = useQuery({
    queryKey: ['vouchers', 'active'],
    queryFn: async () => getVouchers({ isActive: true }),
    enabled: open,
  });

  const transactionQuery = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => getTransactionById(transactionId),
    enabled: open,
  });

  const items = itemsQuery.data ?? [];
  const itemsById = React.useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const itemsWatch = useWatch({ control, name: 'items' }) ?? [];
  const voucherIdWatch = useWatch({ control, name: 'voucherId' }) ?? '';
  const vouchersById = React.useMemo(
    () => new Map((vouchersQuery.data ?? []).map((voucher) => [voucher.id, voucher])),
    [vouchersQuery.data],
  );

  const subtotal = React.useMemo(
    () =>
      itemsWatch.reduce((sum, item) => {
        const price = itemsById.get(item.id)?.price ?? 0;
        return sum + Number(price) * item.quantity;
      }, 0),
    [itemsById, itemsWatch],
  );
  const discountPercentage = React.useMemo(() => {
    if (!voucherIdWatch) return 0;
    return Number(vouchersById.get(voucherIdWatch)?.percentage ?? 0);
  }, [voucherIdWatch, vouchersById]);
  const discountAmount = Math.max(0, (subtotal * discountPercentage) / 100);
  const total = Math.max(0, subtotal - discountAmount);
  const isClosed = transactionQuery.data?.transaction?.status === TransactionStatus.CloseBill;
  const isLocked = Boolean(isClosed && !isAdmin);

  React.useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [defaultValues, open, reset]);

  React.useEffect(() => {
    if (!open) return;
    const transaction = transactionQuery.data?.transaction;
    if (!transaction) return;
    const items = transactionQuery.data?.items ?? [];
    const methodValue = Object.values(PaymentMethod).includes(
      transaction.method as PaymentMethod,
    )
      ? (transaction.method as PaymentMethod)
      : PaymentMethod.Qris;
    const nextValues: TransactionFormValues = {
      customer: transaction.customer ?? '',
      method: methodValue,
      voucherId: transaction.voucherId ?? '',
      items: items
        .map((entry) => ({
          id: entry.detail.itemId,
          quantity: entry.detail.quantity ?? 1,
        }))
        .filter((item) => item.id),
    };
    reset(nextValues);
  }, [open, reset, transactionQuery.data]);

  const handleAddItem = React.useCallback(
    (itemId: string) => {
      if (!itemId) return;
      const currentItems = getValues('items');
      const existingIndex = currentItems.findIndex((item) => item.id === itemId);
      if (existingIndex >= 0) {
        const currentQuantity = currentItems[existingIndex]?.quantity ?? 0;
        setValue(`items.${existingIndex}.quantity`, currentQuantity + 1, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        append({ id: itemId, quantity: 1 });
      }
      clearErrors('items');
      setItemPickerOpen(false);
    },
    [append, clearErrors, getValues, setValue],
  );

  const handleDecrease = React.useCallback(
    (index: number) => {
      const current = getValues(`items.${index}.quantity`);
      const next = Number(current) - 1;
      if (!Number.isFinite(next) || next <= 0) {
        remove(index);
        return;
      }
      setValue(`items.${index}.quantity`, next, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [getValues, remove, setValue],
  );

  const handleIncrease = React.useCallback(
    (index: number) => {
      const current = getValues(`items.${index}.quantity`);
      const next = Number(current) + 1;
      setValue(`items.${index}.quantity`, next, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [getValues, setValue],
  );

  const onSubmit = (values: TransactionFormValues) => {
    if (isLocked) {
      setError('root', {
        type: 'manual',
        message: 'Only admin can update closed transactions.',
      });
      return;
    }
    if (!values.items.length) {
      setError('items', { type: 'manual', message: 'Tambahkan item terlebih dahulu.' });
      return;
    }
    updateTransaction.mutate(
      { id: transactionId, payload: values },
      {
        onSuccess: () => {
          reset(defaultValues);
          setOpen(false);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            Update
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-3xl">
        <TransactionUpdateForm
          control={control}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          onSubmit={onSubmit}
          isPending={updateTransaction.isPending}
          transactionLoading={transactionQuery.isLoading}
          errorMessage={updateTransaction.errorMessage}
          rootErrorMessage={errors.root?.message}
          isLocked={isLocked}
          paymentMethods={Object.values(PaymentMethod)}
          vouchers={vouchersQuery.data ?? []}
          vouchersLoading={vouchersQuery.isLoading}
          items={items}
          itemsById={itemsById}
          itemsLoading={itemsQuery.isLoading}
          itemPickerOpen={itemPickerOpen}
          setItemPickerOpen={setItemPickerOpen}
          onAddItem={handleAddItem}
          fields={fields}
          itemsWatch={itemsWatch}
          onDecrease={handleDecrease}
          onIncrease={handleIncrease}
          onRemove={remove}
          subtotal={subtotal}
          discountAmount={discountAmount}
          total={total}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TransactionUpdate;
