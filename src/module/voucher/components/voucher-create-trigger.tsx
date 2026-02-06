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
  AlertDialogTrigger,
} from '~/shared/ui/alert-dialog';
import { Button } from '~/shared/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/shared/ui/input-group';
import { Label } from '~/shared/ui/label';
import { useCreateVoucher } from '../hook/use-voucher-mutation';
import type { VoucherFormSchema } from '../schema';

const VoucherCreateTrigger = () => {
  const [open, setOpen] = React.useState(false);
  const createVoucher = useCreateVoucher();

  const defaultValues = React.useMemo<VoucherFormSchema>(
    () => ({
      name: '',
      percentage: 10,
    }),
    [],
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
    if (!open) {
      reset(defaultValues);
    }
  }, [defaultValues, open, reset]);

  const onSubmit = (values: VoucherFormSchema) => {
    createVoucher.mutate(values, {
      onSuccess: () => {
        reset(defaultValues);
        setOpen(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="lg">Create voucher</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Create voucher</AlertDialogTitle>
          <AlertDialogDescription>
            Add a voucher discount that can be applied to transactions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="voucher-name">Name</Label>
            <InputGroup>
              <InputGroupInput
                id="voucher-name"
                placeholder="Voucher name"
                aria-invalid={Boolean(errors.name)}
                disabled={createVoucher.isPending}
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
            <Label htmlFor="voucher-percentage">Discount percentage</Label>
            <InputGroup>
              <InputGroupInput
                id="voucher-percentage"
                type="number"
                min={0}
                step={1}
                placeholder="10"
                aria-invalid={Boolean(errors.percentage)}
                disabled={createVoucher.isPending}
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
          {createVoucher.errorMessage ? (
            <p className="text-destructive text-xs/relaxed">
              {createVoucher.errorMessage}
            </p>
          ) : null}
          <AlertDialogFooter className="sm:grid sm:grid-cols-2 sm:items-center">
            <AlertDialogCancel
              type="button"
              disabled={createVoucher.isPending}
              className="w-full"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={createVoucher.isPending}
              className="w-full"
            >
              {createVoucher.isPending ? 'Creating...' : 'Create'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VoucherCreateTrigger;
