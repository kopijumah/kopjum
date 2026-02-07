'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '~/shared/db';
import { transactionsTable } from '~/shared/db/schema';
import { PAYMENT_METHODS, type PaymentMethod, TransactionStatus } from '~/module/transaction/enum';

export type IncomeSummaryParams = {
  from?: number | null;
  to?: number | null;
};

export type DailyIncomeRow = {
  date: string;
  total: number;
};

export type IncomeSummary = {
  total: number;
  daily: DailyIncomeRow[];
  byMethod: Record<PaymentMethod, number>;
  dailyByMethod: {
    date: string;
    method: PaymentMethod;
    total: number;
  }[];
};

const toNumber = (value: unknown) => {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

export async function getIncomeSummary(params: IncomeSummaryParams): Promise<IncomeSummary> {
  const conditions = [eq(transactionsTable.status, TransactionStatus.CloseBill)];

  if (typeof params.from === 'number') {
    conditions.push(gte(transactionsTable.updatedAt, new Date(params.from)));
  }

  if (typeof params.to === 'number') {
    conditions.push(lte(transactionsTable.updatedAt, new Date(params.to)));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const totalExpression = sql<string>`coalesce(sum(${transactionsTable.total}), 0)`;
  const dayExpression = sql<Date>`date_trunc('day', ${transactionsTable.updatedAt})`;

  const [totalRow] = await db
    .select({ total: totalExpression })
    .from(transactionsTable)
    .where(where);

  const dailyRows = await db
    .select({
      day: dayExpression,
      total: totalExpression,
    })
    .from(transactionsTable)
    .where(where)
    .groupBy(dayExpression)
    .orderBy(dayExpression);

  const byMethodRows = await db
    .select({
      method: transactionsTable.method,
      total: totalExpression,
    })
    .from(transactionsTable)
    .where(where)
    .groupBy(transactionsTable.method);

  const dailyByMethodRows = await db
    .select({
      day: dayExpression,
      method: transactionsTable.method,
      total: totalExpression,
    })
    .from(transactionsTable)
    .where(where)
    .groupBy(dayExpression, transactionsTable.method)
    .orderBy(dayExpression);

  const byMethod = PAYMENT_METHODS.reduce((acc, method) => {
    acc[method] = 0;
    return acc;
  }, {} as Record<PaymentMethod, number>);

  for (const row of byMethodRows) {
    const method = row.method as PaymentMethod;
    if (!method) continue;
    byMethod[method] = toNumber(row.total);
  }

  return {
    total: toNumber(totalRow?.total),
    daily: dailyRows.map((row) => {
      const date = row.day instanceof Date ? row.day : new Date(String(row.day));
      return {
        date: date.toISOString(),
        total: toNumber(row.total),
      };
    }),
    byMethod,
    dailyByMethod: dailyByMethodRows.map((row) => {
      const date = row.day instanceof Date ? row.day : new Date(String(row.day));
      return {
        date: date.toISOString(),
        method: row.method as PaymentMethod,
        total: toNumber(row.total),
      };
    }),
  };
}
