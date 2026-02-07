'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Button } from '~/shared/ui/button';
import { Skeleton } from '~/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/shared/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '~/shared/ui/dropdown-menu';
import { Calendar } from '~/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/shared/ui/popover';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  MoreHorizontalCircle01Icon,
} from '@hugeicons/core-free-icons';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/shared/ui/pagination';
import { useTransactionTable } from '../hook/use-transaction-table';
import { useAuth } from '~/module/auth/hook/use-auth';
import type { getTransactions } from '../action';
import { TransactionStatus } from '../enum';
import type { DateRange } from 'react-day-picker';
import TransactionCreate from './transaction-create';
import TransactionUpdate from './transaction-update';
import TransactionReceipt from './transaction-receipt';
import { useToggleTransactionStatus } from '../hook/use-transaction-mutation';
import { Role } from '~/shared/enum';

type Transaction = Awaited<ReturnType<typeof getTransactions>>[number];

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
  }).format(date);
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(value);

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);

const endOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);

const statusConfig = {
  [TransactionStatus.OpenBill]: {
    label: 'Open Bill',
    icon: InformationCircleIcon,
    className: 'bg-amber-500/20',
  },
  [TransactionStatus.CloseBill]: {
    label: 'Close Bill',
    icon: CheckmarkCircle02Icon,
    className: 'bg-green-500/20',
  },
} as const;

const renderStatus = (value: unknown) => {
  const status = typeof value === 'string' ? value : '';
  const config =
    status === TransactionStatus.OpenBill || status === TransactionStatus.CloseBill
      ? statusConfig[status]
      : null;

  if (!config) {
    return <div className="capitalize">{status || '-'}</div>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${config.className}`}
    >
      <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-3" />
      {config.label}
    </span>
  );
};

const TransactionTable = () => {
  const { user } = useAuth();
  const toggleTransactionStatus = useToggleTransactionStatus();
  const {
    transactions,
    total,
    page,
    limit,
    status,
    from,
    to,
    pageCount,
    setPage,
    setLimit,
    setStatus,
    setDateRange,
    isLoading,
    isFetching,
    isError,
    error,
  } = useTransactionTable();
  const [dateRange, setLocalDateRange] = React.useState<DateRange | undefined>();
  const isAdmin = user?.role === Role.ADMIN;

  const columns = React.useMemo<ColumnDef<Transaction>[]>(() => [
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('customer')}</div>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => (
        <div className="uppercase text-muted-foreground">
          {row.getValue('method')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => renderStatus(row.getValue('status')),
    },
    {
      accessorKey: 'total',
      header: () => 'Total',
      cell: ({ row }) => (
        <div className="font-bold">
          {formatCurrency(row.getValue('total'))}
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDateTime(row.getValue('updatedAt'))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const transaction = row.original;
        const isOpen = transaction.status === TransactionStatus.OpenBill;
        const canUpdate = isOpen || isAdmin;
        const canClose = isOpen && !toggleTransactionStatus.isPending;
        const canReopen = !isOpen && isAdmin && !toggleTransactionStatus.isPending;

        return (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" aria-label="Open menu">
                  <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(transaction.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                {canUpdate ? (
                  <TransactionUpdate
                    transactionId={transaction.id}
                    trigger={
                      <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                        Update
                      </DropdownMenuItem>
                    }
                  />
                ) : (
                  <DropdownMenuItem disabled>Update (admin only)</DropdownMenuItem>
                )}
                {isOpen ? (
                  <DropdownMenuItem
                    onClick={() =>
                      toggleTransactionStatus.mutate({
                        id: transaction.id,
                        currentStatus: transaction.status as TransactionStatus,
                      })
                    }
                    disabled={!canClose}
                  >
                    Close bill
                  </DropdownMenuItem>
                ) : isAdmin ? (
                  <DropdownMenuItem
                    onClick={() =>
                      toggleTransactionStatus.mutate({
                        id: transaction.id,
                        currentStatus: transaction.status as TransactionStatus,
                      })
                    }
                    disabled={!canReopen}
                  >
                    Open bill
                  </DropdownMenuItem>
                ) : null}
                <TransactionReceipt
                  transactionId={transaction.id}
                  trigger={
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                      Print
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [isAdmin, toggleTransactionStatus]);

  React.useEffect(() => {
    if (!from && !to) {
      setLocalDateRange(undefined);
      return;
    }
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : fromDate;
    setLocalDateRange({ from: fromDate, to: toDate });
  }, [from, to]);

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  const rows = table.getRowModel().rows;
  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = total === 0 ? 0 : Math.min(total, page * limit);
  const canPreviousPage = page > 1;
  const canNextPage = page < pageCount;
  const pageSizeOptions = [10, 20, 30, 40, 50];
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
  const pages = React.useMemo(() => {
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 'ellipsis', pageCount];
    }

    if (page >= pageCount - 2) {
      return [1, 'ellipsis', pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
    }

    return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', pageCount];
  }, [page, pageCount]);

  return (
    <div className="flex h-full w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold leading-none">Transactions</h2>
          <p className="text-muted-foreground text-sm">
            {isFetching ? 'Updating data...' : 'Latest transactions overview'}
          </p>
        </div>
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
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
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
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-md border">
        <Table className="min-w-full w-max text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-sm">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 20 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column, cellIndex) => (
                    <TableCell
                      key={`${String(column.id ?? cellIndex)}-${cellIndex}`}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isError ? error?.message ?? 'Failed to load transactions.' : 'No transactions yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted-foreground">
          Showing {showingStart}-{showingEnd} of {total}
        </div>
        <div className="flex w-full flex-col items-start gap-3.5 sm:w-auto sm:items-end">
          <span className="text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <Pagination className="w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(event) => {
                    event.preventDefault();
                    if (!canPreviousPage) return;
                    void setPage(page - 1);
                  }}
                  href="#"
                  aria-disabled={!canPreviousPage}
                  className={!canPreviousPage ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
              {pages.map((item, index) => {
                if (item === 'ellipsis') {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                const pageNumber = item;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === page}
                      onClick={(event) => {
                        event.preventDefault();
                        void setPage(pageNumber as number);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={(event) => {
                    event.preventDefault();
                    if (!canNextPage) return;
                    void setPage(page + 1);
                  }}
                  href="#"
                  aria-disabled={!canNextPage}
                  className={!canNextPage ? 'pointer-events-none opacity-50' : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
