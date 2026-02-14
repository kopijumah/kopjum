'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getIncomeSummary } from '../action';
import { TransactionStatus } from '~/module/transaction/enum';

const rangeParsers = {
  from: parseAsInteger,
  to: parseAsInteger,
  status: parseAsString,
};

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);

const endOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);

const addDays = (value: Date, amount: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
};

export const useAnalyticSummary = () => {
  const [range, setRange] = useQueryStates(rangeParsers, {
    history: 'replace',
  });

  const today = new Date();
  const defaultFrom = startOfDay(addDays(today, -6)).getTime();
  const defaultTo = endOfDay(today).getTime();

  const from = typeof range.from === 'number' ? range.from : defaultFrom;
  const to = typeof range.to === 'number' ? range.to : defaultTo;
  const status =
    range.status === TransactionStatus.OpenBill ||
    range.status === TransactionStatus.CloseBill
      ? range.status
      : null;

  const query = useQuery({
    queryKey: ['analytics', from, to, status],
    queryFn: async () => getIncomeSummary({ from, to, status }),
    placeholderData: (previous) => previous,
  });

  const setDateRange = React.useCallback(
    (nextFrom: number | null, nextTo: number | null) =>
      setRange({
        from: nextFrom ?? null,
        to: nextTo ?? null,
      }),
    [setRange],
  );

  const setStatus = React.useCallback(
    (nextStatus: TransactionStatus | null) =>
      setRange({
        status: nextStatus ?? null,
      }),
    [setRange],
  );

  return {
    data: query.data,
    from,
    to,
    status,
    setDateRange,
    setStatus,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
  };
};
