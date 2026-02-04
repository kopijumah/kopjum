'use server';

import { and, count, eq, gte, lte, SQL } from "drizzle-orm";
import { db } from "~/shared/db";
import { itemsTable, transactionItemsTable, transactionsTable } from "~/shared/db/schema";
import { TransactionStatus } from "../enum";
import { verifySession } from "~/shared/session";

type Params = {
  page: number;
  limit: number;
  status?: TransactionStatus | null;
  from?: number | null;
  to?: number | null;
}

export async function getTransactions(params: Params) {
  const conditions: SQL<unknown>[] = [];
  if (params.status) {
    conditions.push(eq(transactionsTable.status, params.status));
  }
  if (typeof params.from === 'number') {
    conditions.push(gte(transactionsTable.updatedAt, new Date(params.from)));
  }
  if (typeof params.to === 'number') {
    conditions.push(lte(transactionsTable.updatedAt, new Date(params.to)));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  return await db.query.transactionsTable.findMany({
    limit: params.limit,
    offset: (params.page - 1) * params.limit,
    where,
    orderBy: (transactionsTable, { desc }) => [
      desc(transactionsTable.updatedAt),
    ],
  });
}

export async function getTransactionCount(params: Params) {
  const conditions: SQL<unknown>[] = [];
  if (params.status) {
    conditions.push(eq(transactionsTable.status, params.status));
  }
  if (typeof params.from === 'number') {
    conditions.push(gte(transactionsTable.updatedAt, new Date(params.from)));
  }
  if (typeof params.to === 'number') {
    conditions.push(lte(transactionsTable.updatedAt, new Date(params.to)));
  }
  const [total] = await db
    .select({ count: count() })
    .from(transactionsTable)
    .where(conditions.length ? and(...conditions) : undefined);
  return total.count;
}

export async function getTransactionById(id: string) {
  await verifySession();

  const transaction = await db.query.transactionsTable.findFirst({
    where: eq(transactionsTable.id, id),
  });

  const items = await db
    .select({
      item: itemsTable,
      detail: transactionItemsTable,
    })
    .from(transactionItemsTable)
    .leftJoin(itemsTable, eq(transactionItemsTable.itemId, itemsTable.id))
    .where(eq(transactionItemsTable.transactionId, id));

  return {
    transaction,
    items,
  };
}