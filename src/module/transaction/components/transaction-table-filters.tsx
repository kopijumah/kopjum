import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { Button } from '~/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/shared/ui/dropdown-menu';
import { Calendar } from '~/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/shared/ui/popover';
import type { DateRange } from 'react-day-picker';
import { TransactionStatus } from '../enum';
import TransactionCreate from './transaction-create';
import { endOfDay, formatDate, startOfDay } from '~/shared/lib/time';

type TransactionTableFiltersProps = {
  status: TransactionStatus | null;
  setStatus: (nextStatus: TransactionStatus | null) => void | Promise<unknown>;
  limit: number;
  setLimit: (nextLimit: number) => void | Promise<unknown>;
  dateRange: DateRange | undefined;
  setDateRange: (from: number | null, to: number | null) => void | Promise<unknown>;
  setLocalDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
};

const TransactionTableFilters = ({
  status,
  setStatus,
  limit,
  setLimit,
  dateRange,
  setDateRange,
  setLocalDateRange,
}: TransactionTableFiltersProps) => {
  const statusFilter = status ?? 'ALL';
  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
      : formatDate(dateRange.from)
    : 'All dates';
  const statusOptions = [
    { label: 'All statuses', value: 'ALL' },
    { label: 'Open bill', value: TransactionStatus.OpenBill },
    { label: 'Close bill', value: TransactionStatus.CloseBill },
  ];
  const pageSizeOptions = [10, 20, 30, 40, 50];

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-muted-foreground">Status</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="min-fit gap-1 px-3"
            id="transaction-status-filter"
          >
            {statusOptions.find((option) => option.value === statusFilter)
              ?.label ?? 'All statuses'}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-3 text-muted-foreground"
              data-icon="inline-end"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={statusFilter}
            onValueChange={(value) => {
              const nextStatus =
                value === TransactionStatus.OpenBill ||
                value === TransactionStatus.CloseBill
                  ? value
                  : null;
              void setStatus(nextStatus);
            }}
          >
            {statusOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="text-muted-foreground">Date</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="min-fit gap-1 px-3 text-left font-normal"
            data-empty={!dateRange?.from}
          >
            {dateLabel}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-3 text-muted-foreground"
              data-icon="inline-end"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={dateRange}
            disabled={{ after: new Date() }}
            onSelect={(range) => {
              setLocalDateRange(range);
              if (!range?.from) {
                void setDateRange(null, null);
                return;
              }
              const fromDate = startOfDay(range.from);
              const toDate = endOfDay(range.to ?? range.from);
              void setDateRange(fromDate.getTime(), toDate.getTime());
            }}
            initialFocus
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      <span className="text-muted-foreground">Rows per page</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="min-fit gap-1 px-3"
            id="transaction-limit-trigger"
          >
            {limit}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              strokeWidth={2}
              className="size-3 text-muted-foreground"
              data-icon="inline-end"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={String(limit)}
            onValueChange={(value) => {
              const nextLimit = Number(value);
              if (!Number.isFinite(nextLimit)) return;
              void setLimit(nextLimit);
            }}
          >
            {pageSizeOptions.map((option) => (
              <DropdownMenuRadioItem key={option} value={String(option)}>
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <TransactionCreate />
    </div>
  );
};

export default TransactionTableFilters;
