
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getTransactionCount, getTransactions } from '../action';
import { TransactionStatus } from '../enum';

type Transaction = Awaited<ReturnType<typeof getTransactions>>[number];

const paginationParsers = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  status: parseAsString,
  from: parseAsInteger,
  to: parseAsInteger,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const useTransactionTable = () => {
  const [pagination, setPagination] = useQueryStates(paginationParsers, {
    history: 'replace',
  });

  const page = Math.max(1, pagination.page);
  const limit = Math.max(1, pagination.limit);
  const status =
    pagination.status === TransactionStatus.OpenBill ||
    pagination.status === TransactionStatus.CloseBill
      ? pagination.status
      : null;
  const from = typeof pagination.from === 'number' ? pagination.from : null;
  const to = typeof pagination.to === 'number' ? pagination.to : null;

  const transactionsQuery = useQuery({
    queryKey: ['transactions', page, limit, status, from, to],
    queryFn: async () => getTransactions({ page, limit, status, from, to }),
    placeholderData: (previous) => previous,
  });

  const countQuery = useQuery({
    queryKey: ['transactions', 'count', status, from, to],
    queryFn: async () => getTransactionCount({ page: 1, limit: 1, status, from, to }),
  });

  const total = countQuery.data ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  React.useEffect(() => {
    if (page > pageCount) {
      void setPagination({ page: pageCount });
    }
  }, [page, pageCount, setPagination]);

  const setPage = React.useCallback(
    (nextPage: number) => {
      const safePage = Number.isFinite(nextPage) ? nextPage : 1;
      return setPagination({ page: clamp(safePage, 1, pageCount) });
    },
    [pageCount, setPagination],
  );

  const setLimit = React.useCallback(
    (nextLimit: number) => {
      const safeLimit = Number.isFinite(nextLimit) ? nextLimit : 1;
      return setPagination({
        limit: clamp(safeLimit, 1, 100),
        page: 1,
      });
    },
    [setPagination],
  );

  const setStatus = React.useCallback(
    (nextStatus: TransactionStatus | null) =>
      setPagination({
        status: nextStatus ?? null,
        page: 1,
      }),
    [setPagination],
  );

  const setDateRange = React.useCallback(
    (nextFrom: number | null, nextTo: number | null) =>
      setPagination({
        from: nextFrom ?? null,
        to: nextTo ?? null,
        page: 1,
      }),
    [setPagination],
  );

  return {
    transactions: (transactionsQuery.data ?? []) as Transaction[],
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
    isLoading: transactionsQuery.isLoading || countQuery.isLoading,
    isFetching: transactionsQuery.isFetching || countQuery.isFetching,
    isError: transactionsQuery.isError || countQuery.isError,
    error:
      (transactionsQuery.error as Error | null) ??
      (countQuery.error as Error | null),
    refetch: transactionsQuery.refetch,
  };
};
