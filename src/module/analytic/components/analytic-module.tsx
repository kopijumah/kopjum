'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { Button } from '~/shared/ui/button';
import { Calendar } from '~/shared/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/shared/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '~/shared/ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '~/shared/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '~/shared/ui/popover';
import { Skeleton } from '~/shared/ui/skeleton';
import type { DateRange } from 'react-day-picker';
import {
  PAYMENT_METHOD_CONFIG,
  PAYMENT_METHODS,
  TransactionStatus,
  type PaymentMethod,
} from '~/module/transaction/enum';
import { useAnalyticSummary } from '../hook/use-analytic';

const chartConfig = PAYMENT_METHOD_CONFIG.reduce((acc, method) => {
  acc[method.value] = { label: method.label, color: method.color };
  return acc;
}, {} as ChartConfig);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);

const formatShortDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(value);

const formatRangeDate = (value: Date) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(value);

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);

const endOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);

const toDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDailySeries = (
  from: number,
  to: number,
  dailyByMethod: { date: string; method: string; total: number }[],
) => {
  let start = startOfDay(new Date(from));
  let end = endOfDay(new Date(to));
  if (start > end) {
    [start, end] = [end, start];
  }
  const dailyMap = new Map<string, Record<string, number>>();
  for (const row of dailyByMethod) {
    const parsed = new Date(row.date);
    const key = toDateKey(parsed);
    const entry = dailyMap.get(key) ?? {};
    entry[row.method] = row.total;
    dailyMap.set(key, entry);
  }

  const result: Array<{ date: string; label: string } & Record<PaymentMethod, number>> = [];
  for (let cursor = new Date(start); cursor <= end;) {
    const key = toDateKey(cursor);
    const bucket = dailyMap.get(key) ?? {};
    const row = PAYMENT_METHODS.reduce(
      (acc, method) => {
        acc[method] = bucket[method] ?? 0;
        return acc;
      },
      {
        date: key,
        label: formatShortDate(cursor),
      } as { date: string; label: string } & Record<PaymentMethod, number>,
    );
    result.push(row);
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

const AnalyticModule = () => {
  const {
    data,
    from,
    to,
    status,
    setDateRange,
    setStatus,
    isLoading,
    isFetching,
    isError,
    error,
  } = useAnalyticSummary();
  const [dateRange, setLocalDateRange] = React.useState<DateRange | undefined>();

  const fromDate = new Date(from);
  const toDate = new Date(to);

  React.useEffect(() => {
    if (!Number.isFinite(from) || !Number.isFinite(to)) return;
    setLocalDateRange({ from: fromDate, to: toDate });
  }, [from, to]);

  const dateLabel = React.useMemo(() => {
    if (!fromDate || !toDate || Number.isNaN(fromDate.valueOf())) return 'Pick date range';
    const fromLabel = formatRangeDate(fromDate);
    const toLabel = formatRangeDate(toDate);
    return fromLabel === toLabel ? fromLabel : `${fromLabel} - ${toLabel}`;
  }, [fromDate, toDate]);

  const statusFilter = status ?? 'ALL';
  const statusOptions = [
    { label: 'All statuses', value: 'ALL' },
    { label: 'Open bill', value: TransactionStatus.OpenBill },
    { label: 'Close bill', value: TransactionStatus.CloseBill },
  ];
  const statusLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label ??
    'All statuses';

  const chartData = React.useMemo(
    () => buildDailySeries(from, to, data?.dailyByMethod ?? []),
    [from, to, data?.dailyByMethod],
  );
  const paymentShareData = React.useMemo(() => {
    const total = data?.total ?? 0;
    return PAYMENT_METHOD_CONFIG.map((method) => {
      const value = data?.byMethod?.[method.value] ?? 0;
      const percentage = total > 0 ? (value / total) * 100 : 0;
      return {
        key: method.value,
        label: method.label,
        value,
        percentage,
        color: method.color,
      };
    });
  }, [data?.byMethod, data?.total]);
  const rangeDays = React.useMemo(() => {
    if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
    const start = startOfDay(new Date(from)).getTime();
    const end = startOfDay(new Date(to)).getTime();
    const diff = Math.abs(end - start);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [from, to]);
  const showDailyIncome = rangeDays > 1;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 bg-background/95 pb-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground text-xs/relaxed">
            Track daily income and total money coming in.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="text-muted-foreground text-xs">Status</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-fit w-full justify-between gap-2 px-3 sm:w-auto"
                  id="analytics-status-filter"
                >
                  {statusLabel}
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
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="text-muted-foreground text-xs">Date range</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-fit w-full justify-between gap-2 px-3 text-left font-normal sm:w-auto"
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
                    const fromRange = startOfDay(range.from);
                    const toRange = endOfDay(range.to ?? range.from);
                    void setDateRange(fromRange.getTime(), toRange.getTime());
                  }}
                  initialFocus
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error?.message ?? 'Failed to load analytics'}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
            <CardDescription>
              {dateLabel} • {statusLabel}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isLoading && !data ? (
              <Skeleton className="h-8 w-40" />
            ) : (
              <div className="text-2xl font-semibold">
                {formatCurrency(data?.total ?? 0)}
              </div>
            )}
            <p className="text-muted-foreground mt-2 text-xs">
              Daily totals are based on{' '}
              {statusLabel === 'All statuses'
                ? 'all bills'
                : statusLabel.toLowerCase()}
              .
            </p>
            <div className="border-t pt-4">
              <div className="text-sm font-semibold">Payment Method Share</div>
              <p className="text-muted-foreground text-xs">
                Percentage of total income • {statusLabel}
              </p>
              {isLoading && !data ? (
                <div className="mt-3 grid gap-3">
                  {PAYMENT_METHOD_CONFIG.map((method) => (
                    <Skeleton key={method.value} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="mt-3">
                  <ChartContainer
                    config={chartConfig}
                    className="h-56 w-full sm:h-64"
                  >
                    <BarChart
                      accessibilityLayer
                      data={paymentShareData}
                      layout="vertical"
                      margin={{ left: -12, right: 16, top: 8, bottom: 8 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <YAxis
                        dataKey="label"
                        type="category"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        width={90}
                      />
                      <XAxis dataKey="percentage" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            indicator="line"
                            formatter={(value, name, item) => (
                              <div className="flex w-full items-center justify-between gap-3">
                                <span className="text-muted-foreground">
                                  {item?.payload?.label}
                                </span>
                                <span className="font-mono font-medium tabular-nums text-foreground">
                                  {formatCurrency(Number(item?.payload?.value ?? 0))}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Bar
                        dataKey="percentage"
                        layout="vertical"
                        radius={5}
                      >
                        {paymentShareData.map((entry) => (
                          <Cell key={entry.key} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showDailyIncome ? (
          <Card className="min-h-70">
            <CardHeader>
              <CardTitle>Daily Income</CardTitle>
              <CardDescription>
                Last {chartData.length} days • {statusLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !data ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ChartContainer config={chartConfig} className="h-56 w-full">
                  <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickMargin={8}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('id-ID', {
                          notation: 'compact',
                          maximumFractionDigits: 1,
                        }).format(Number(value))
                      }
                      axisLine={false}
                      tickLine={false}
                      width={64}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          indicator="dot"
                          formatter={(value) => (
                            <span className="text-foreground font-mono font-medium tabular-nums">
                              {formatCurrency(Number(value))}
                            </span>
                          )}
                        />
                      }
                    />
                    {PAYMENT_METHOD_CONFIG.map((method) => (
                      <Area
                        key={method.value}
                        dataKey={method.value}
                        type="monotone"
                        stackId="income"
                        fill={`var(--color-${method.value})`}
                        fillOpacity={0.2}
                        stroke={`var(--color-${method.value})`}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </AreaChart>
                </ChartContainer>
              )}
              {isFetching && !isLoading ? (
                <div className="text-muted-foreground mt-2 text-xs">Updating…</div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default AnalyticModule;
