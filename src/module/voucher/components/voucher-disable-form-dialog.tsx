'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/shared/ui/alert-dialog';
import { useDisableVoucher } from '../hook/use-voucher-mutation';
import type { getVouchers } from '../action';

type Voucher = Awaited<ReturnType<typeof getVouchers>>[number];

type VoucherDisableFormDialogProps = {
  voucher: Voucher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const VoucherDisableFormDialog = ({ voucher, open, onOpenChange }: VoucherDisableFormDialogProps) => {
  const disableVoucher = useDisableVoucher();

  const handleConfirm = () => {
    disableVoucher.mutate(voucher.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Disable voucher</AlertDialogTitle>
          <AlertDialogDescription>
            This will hide "{voucher.name}" from active vouchers. You can add it back by
            creating a new voucher.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disableVoucher.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={disableVoucher.isPending}
            onClick={handleConfirm}
          >
            {disableVoucher.isPending ? 'Disabling...' : 'Disable'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default VoucherDisableFormDialog;
