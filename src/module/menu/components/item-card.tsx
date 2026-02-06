'use client';

import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AnalyticsUpIcon,
  Bread02Icon,
  DocumentAttachmentIcon,
  MoreHorizontalCircle01Icon,
  SoftDrink01Icon,
  Wallet03Icon,
} from '@hugeicons/core-free-icons';
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
import type { getItems } from '../action';
import { ItemType } from '../enum';
import ItemUpdateFormDialog from './item-update-form-dialog';
import ItemDisableFormDialog from './item-disable-form-dialog';

export type Item = Awaited<ReturnType<typeof getItems>>[number];

type ItemCardProps = {
  item: Item;
  isAdmin?: boolean;
};

const formatCurrency = (value: unknown) => {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(Number.isFinite(amount) ? amount : 0);
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

const itemTypeConfig = {
  [ItemType.FOOD]: {
    label: 'Food',
    icon: Bread02Icon,
    className: 'bg-amber-500/20 text-amber-500',
  },
  [ItemType.DRINK]: {
    label: 'Drink',
    icon: SoftDrink01Icon,
    className: 'bg-blue-500/20 text-blue-500',
  },
  default: {
    label: 'Menu',
    icon: AnalyticsUpIcon,
    className: 'bg-muted text-foreground',
  },
} as const;

const ItemCard = ({ item, isAdmin }: ItemCardProps) => {
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [disableOpen, setDisableOpen] = React.useState(false);

  const typeConfig =
    item.type === ItemType.FOOD || item.type === ItemType.DRINK
      ? itemTypeConfig[item.type]
      : itemTypeConfig.default;

  const categoryLabel = React.useMemo(() => {
    if (!item.category) return '-';
    const titleCased = item.category
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return titleCased === 'Adds On' ? 'Add Ons' : titleCased;
  }, [item.category]);

  return (
    <Card className="gap-3">
      <CardHeader className="gap-y-3">
        <CardTitle className="flex items-center gap-2">
          <span
            className={`inline-flex size-8 items-center justify-center rounded-md ${typeConfig.className}`}
          >
            <HugeiconsIcon icon={typeConfig.icon} strokeWidth={2} className="size-4" />
          </span>
          <span className="line-clamp-1">{item.name}</span>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold uppercase">
            {typeConfig.label}
          </span>
          <span className="text-muted-foreground">•</span>
          <span>{categoryLabel}</span>
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
        <span className="text-muted-foreground">Price</span>
        <span className="text-sm font-semibold">
          {formatCurrency(item.price)}
        </span>
      </CardContent>
      <CardFooter className="text-muted-foreground text-[0.625rem]">
        Updated {formatDateTime(item.updatedAt)}
      </CardFooter>
      <ItemUpdateFormDialog
        item={item}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
      />
      <ItemDisableFormDialog
        item={item}
        open={disableOpen}
        onOpenChange={setDisableOpen}
      />
    </Card>
  );
};

export default ItemCard;
