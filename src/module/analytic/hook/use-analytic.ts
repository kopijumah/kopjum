'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { getIncomeSummary } from '../action';

const rangeParsers = {
  from: parseAsInteger,
  to: parseAsInteger,
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

  const query = useQuery({
    queryKey: ['analytics', from, to],
    queryFn: async () => getIncomeSummary({ from, to }),
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

  return {
    data: query.data,
    from,
    to,
    setDateRange,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
  };
};
