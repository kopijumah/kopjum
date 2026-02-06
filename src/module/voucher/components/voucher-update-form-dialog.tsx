'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/shared/ui/alert-dialog';
import { Button } from '~/shared/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/shared/ui/input-group';
import { Label } from '~/shared/ui/label';
import { useUpdateVoucher } from '../hook/use-voucher-mutation';
import type { VoucherFormSchema } from '../schema';
import type { getVouchers } from '../action';

type Voucher = Awaited<ReturnType<typeof getVouchers>>[number];

type VoucherUpdateFormDialogProps = {
  voucher: Voucher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const VoucherUpdateFormDialog = ({ voucher, open, onOpenChange }: VoucherUpdateFormDialogProps) => {
  const updateVoucher = useUpdateVoucher();

  const defaultValues = React.useMemo<VoucherFormSchema>(
    () => ({
      name: voucher.name ?? '',
      percentage: Number(voucher.percentage ?? 0),
    }),
    [voucher],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VoucherFormSchema>({
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [defaultValues, open, reset]);

  const onSubmit = (values: VoucherFormSchema) => {
    updateVoucher.mutate(
      { id: voucher.id, data: values },
      {
        onSuccess: () => {
          reset(values);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="min-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Update voucher</AlertDialogTitle>
          <AlertDialogDescription>
            Update voucher details for transactions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor={`voucher-update-name-${voucher.id}`}>Name</Label>
            <InputGroup>
              <InputGroupInput
                id={`voucher-update-name-${voucher.id}`}
                placeholder="Voucher name"
                aria-invalid={Boolean(errors.name)}
                disabled={updateVoucher.isPending}
                {...register('name', {
                  required: 'Nama voucher wajib diisi',
                  minLength: {
                    value: 3,
                    message: 'Nama voucher wajib diisi dan minimal 3 huruf',
                  },
                })}
              />
            </InputGroup>
            {errors.name ? (
              <p className="text-destructive text-xs/relaxed">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`voucher-update-percentage-${voucher.id}`}>
              Discount percentage
            </Label>
            <InputGroup>
              <InputGroupInput
                id={`voucher-update-percentage-${voucher.id}`}
                type="number"
                min={0}
                step={1}
                placeholder="10"
                aria-invalid={Boolean(errors.percentage)}
                disabled={updateVoucher.isPending}
                {...register('percentage', {
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: 'Diskon minimal 1%',
                  },
                  max: {
                    value: 100,
                    message: 'Diskon maksimal 100%',
                  },
                })}
              />
              <InputGroupAddon>%</InputGroupAddon>
            </InputGroup>
            {errors.percentage ? (
              <p className="text-destructive text-xs/relaxed">
                {errors.percentage.message}
              </p>
            ) : null}
          </div>
          {updateVoucher.errorMessage ? (
            <p className="text-destructive text-xs/relaxed">
              {updateVoucher.errorMessage}
            </p>
          ) : null}
          <AlertDialogFooter className="sm:grid sm:grid-cols-2 sm:items-center">
            <AlertDialogCancel
              type="button"
              disabled={updateVoucher.isPending}
              className="w-full"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={updateVoucher.isPending}
              className="w-full"
            >
              {updateVoucher.isPending ? 'Updating...' : 'Update'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VoucherUpdateFormDialog;
