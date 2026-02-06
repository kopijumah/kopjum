'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Coupon02Icon, DocumentAttachmentIcon, MoreHorizontalCircle01Icon } from '@hugeicons/core-free-icons';
import { Button } from '~/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/shared/ui/dropdown-menu';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/shared/ui/card';
import type { getVouchers } from '../action';
import VoucherUpdateFormDialog from './voucher-update-form-dialog';
import VoucherDisableFormDialog from './voucher-disable-form-dialog';

export type Voucher = Awaited<ReturnType<typeof getVouchers>>[number];

type VoucherCardProps = {
  voucher: Voucher;
  isAdmin?: boolean;
};

const formatPercentage = (value: unknown) => {
  const percentage = typeof value === 'number' ? value : Number(value ?? 0);
  return `${Number.isFinite(percentage) ? percentage : 0}%`;
};

const formatDateTime = (value: unknown) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.valueOf())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const VoucherCard = ({ voucher, isAdmin }: VoucherCardProps) => {
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);

  return (
    <Card className="gap-3">
      <CardHeader className="gap-1">
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HugeiconsIcon icon={Coupon02Icon} strokeWidth={2} className="size-4" />
          </span>
          <span className="line-clamp-1">{voucher.name}</span>
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Discount voucher
        </CardDescription>
        {isAdmin ? (
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                  <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
                  Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDisableOpen(true)}>
                  Disable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className="text-muted-foreground">Discount</span>
        <span className="text-sm font-semibold">
          {formatPercentage(voucher.percentage)}
        </span>
      </CardContent>
      <CardFooter className="text-muted-foreground text-[0.625rem]">
        Updated {formatDateTime(voucher.updatedAt)}
      </CardFooter>
      <VoucherUpdateFormDialog
        voucher={voucher}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
      />
      <VoucherDisableFormDialog
        voucher={voucher}
        open={disableOpen}
        onOpenChange={setDisableOpen}
      />
    </Card>
  );
};

export default VoucherCard;
