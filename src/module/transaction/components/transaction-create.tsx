'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/shared/ui/alert-dialog';
import { Button } from '~/shared/ui/button';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/shared/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '~/shared/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/shared/ui/command';
import { useCreateTransaction } from '../hook/use-transaction-mutation';
import { PaymentMethod } from '../enum';
import { getItems } from '~/module/menu/action';
import type { TransactionFormSchema } from '../schema';
import { cn } from '~/shared/lib/utils';

type TransactionFormValues = TransactionFormSchema;

const formatCurrency = (value: unknown) => {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(Number.isFinite(amount) ? amount : 0);
};

const TransactionCreate = () => {
  const [open, setOpen] = React.useState(false);
  const [itemPickerOpen, setItemPickerOpen] = React.useState(false);
  const createTransaction = useCreateTransaction();

  const defaultValues = React.useMemo<TransactionFormValues>(
    () => ({
      customer: '',
      method: PaymentMethod.Qris,
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
    queryKey: ['menu-items', 'active'],
    queryFn: async () => getItems({ isActive: true }),
    enabled: open,
  });

  const items = itemsQuery.data ?? [];
  const itemsById = React.useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const itemsWatch = useWatch({ control, name: 'items' }) ?? [];

  const total = React.useMemo(
    () =>
      itemsWatch.reduce((sum, item) => {
        const price = itemsById.get(item.id)?.price ?? 0;
        return sum + Number(price) * item.quantity;
      }, 0),
    [itemsById, itemsWatch],
  );

  React.useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
  }, [defaultValues, open, reset]);

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
    if (!values.items.length) {
      setError('items', { type: 'manual', message: 'Tambahkan item terlebih dahulu.' });
      return;
    }
    createTransaction.mutate(values, {
      onSuccess: () => {
        reset(defaultValues);
        setOpen(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="lg">Create transaction</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className='min-w-3xl'>
        <AlertDialogHeader>
          <AlertDialogTitle>Create transaction</AlertDialogTitle>
          <AlertDialogDescription>
            This will open a new transaction flow. You can add customer and items
            after creation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="transaction-customer">Customer</Label>
            <Input
              id="transaction-customer"
              placeholder="Customer name"
              aria-invalid={Boolean(errors.customer)}
              disabled={createTransaction.isPending}
              {...register('customer', {
                required: 'Pelanggan wajib diisi',
                minLength: {
                  value: 3,
                  message: 'Pelanggan wajib diisi dan minimal 3 huruf',
                },
              })}
            />
            {errors.customer ? (
              <p className="text-destructive text-xs/relaxed">
                {errors.customer.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label>Payment method</Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as PaymentMethod)}
                  disabled={createTransaction.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Items</Label>
              <Popover open={itemPickerOpen} onOpenChange={setItemPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={itemsQuery.isLoading || createTransaction.isPending}
                  >
                    Add item
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Search item" />
                    <CommandList>
                      <CommandEmpty>
                        {itemsQuery.isLoading
                          ? 'Loading items...'
                          : 'No items found.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.name}
                            onSelect={() => handleAddItem(item.id)}
                          >
                            <span className="flex-1">{item.name}</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(item.price)}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {fields.length ? (
              <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
                {fields.map((field, index) => {
                  const item = itemsById.get(field.id);
                  const quantityValue =
                    itemsWatch[index]?.quantity ?? field.quantity ?? 1;
                  const idField = register(`items.${index}.id`);
                  const quantityField = register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: 'Kuantitas harus lebih besar atau sama dengan 1',
                    },
                  });
                  return (
                    <div
                      key={field.fieldKey}
                      className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-md px-3 py-2"
                    >
                      <input type="hidden" {...idField} value={field.id} />
                      <input
                        type="hidden"
                        {...quantityField}
                        value={quantityValue}
                        readOnly
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium">
                          {item?.name ?? 'Unknown item'}
                        </p>
                        <p className="text-muted-foreground text-[0.625rem]">
                          {formatCurrency(item?.price ?? 0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          disabled={createTransaction.isPending}
                          onClick={() => handleDecrease(index)}
                        >
                          -
                        </Button>
                        <span
                          className={cn(
                            'inline-flex h-6 w-10 items-center justify-center rounded-md border px-1 text-xs',
                            {
                              'border-destructive': Boolean(
                                errors.items?.[index]?.quantity,
                              ),
                            },
                          )}
                        >
                          {quantityValue}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          disabled={createTransaction.isPending}
                          onClick={() => handleIncrease(index)}
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={createTransaction.isPending}
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs/relaxed">
                No items selected yet.
              </p>
            )}
            {errors.items?.message ? (
              <p className="text-destructive text-xs/relaxed">
                {errors.items.message}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between rounded-md border bg-primary/10 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          {createTransaction.errorMessage ? (
            <p className="text-destructive text-xs/relaxed">
              {createTransaction.errorMessage}
            </p>
          ) : null}
          <AlertDialogFooter className="sm:grid sm:grid-cols-2 sm:items-center">
            <AlertDialogCancel
              type="button"
              disabled={createTransaction.isPending}
              className="w-full"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={createTransaction.isPending}
              className="w-full"
            >
              {createTransaction.isPending ? 'Creating...' : 'Create'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TransactionCreate;
