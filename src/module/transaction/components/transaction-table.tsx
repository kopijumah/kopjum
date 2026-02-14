'use client';

import * as React from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useTransactionTable } from '../hook/use-transaction-table';
import { useAuth } from '~/module/auth/hook/use-auth';
import type { DateRange } from 'react-day-picker';
import { useToggleTransactionStatus } from '../hook/use-transaction-mutation';
import { Role } from '~/shared/enum';
import buildTransactionColumns from './transaction-table-columns';
import TransactionTableFilters from './transaction-table-filters';
import TransactionTableBody from './transaction-table-body';
import TransactionTablePagination from './transaction-table-pagination';
import { Typography } from '~/shared/ui/text';

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

  const columns = React.useMemo(
    () =>
      buildTransactionColumns({
        isAdmin,
        toggleTransactionStatus,
      }),
    [isAdmin, toggleTransactionStatus],
  );

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

  return (
    <div className="flex h-full w-full flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h2" className="text-lg font-semibold leading-none">
            Transactions
          </Typography>
          <Typography className="text-muted-foreground text-sm">
            {isFetching ? 'Updating data...' : 'Latest transactions overview'}
          </Typography>
        </div>
        <TransactionTableFilters
          status={status}
          setStatus={setStatus}
          limit={limit}
          setLimit={setLimit}
          dateRange={dateRange}
          setDateRange={setDateRange}
          setLocalDateRange={setLocalDateRange}
        />
      </div>
      <TransactionTableBody
        table={table}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
      <TransactionTablePagination
        page={page}
        pageCount={pageCount}
        total={total}
        limit={limit}
        setPage={setPage}
      />
    </div>
  );
};

export default TransactionTable;
