'use server'

import { verifySession } from "~/shared/session";
import { TransactionFormSchema } from "../schema";
import { db } from "~/shared/db";
import { getItems } from "~/module/menu/action";
import { getVouchers } from "~/module/voucher/action";
import { transactionItemsTable, transactionsTable } from "~/shared/db/schema";
import { TransactionStatus } from "../enum";
import { eq } from "drizzle-orm";
import { Role } from "~/shared/enum";

export async function createTransaction(params: TransactionFormSchema) {
  const session = await verifySession();

  const items = await getItems({
    ids: params.items.map((e) => e.id),
    isActive: true,
  });

  const itemsById = new Map(items.map((e) => [e.id, e.price]));

  const subtotal = params.items.reduce((total, item) => {
    const price = itemsById.get(item.id);
    if (!price) throw new Error('Item not found');

    return total + item.quantity * Number(price);
  }, 0);

  const voucherId = params.voucherId?.trim();
  let discount = 0;
  let appliedVoucherId: string | null = null;

  if (voucherId) {
    const [voucher] = await getVouchers({ ids: [voucherId], isActive: true });
    if (!voucher) {
      throw new Error('Voucher not found');
    }
    discount = Math.max(0, Math.min(100, Number(voucher.percentage ?? 0)));
    appliedVoucherId = voucher.id;
  }

  const total = Math.max(0, subtotal - (subtotal * discount) / 100);

  await db.transaction(async (tx) => {
    const [transaction] = await tx
      .insert(transactionsTable)
      .values({
        customer: params.customer,
        method: params.method,
        status: TransactionStatus.OpenBill,
        total: total.toString(),
        voucherId: appliedVoucherId,
        createdAt: new Date(),
        createdBy: session.username,
        updatedAt: new Date(),
        updatedBy: session.username,
      })
      .returning({ id: transactionsTable.id });

    await tx.insert(transactionItemsTable).values(
      params.items.map((e) => ({
        itemId: e.id,
        transactionId: transaction.id,
        quantity: e.quantity,
        createdAt: new Date(),
        createdBy: session.username,
        updatedAt: new Date(),
        updatedBy: session.username,
      })),
    );
  });

  return { ok: true };
}

export async function toggleTransactionStatusById(
  id: string,
  currentStatus: TransactionStatus,
) {
  const session = await verifySession();

  const nextStatus =
    currentStatus === TransactionStatus.OpenBill
      ? TransactionStatus.CloseBill
      : TransactionStatus.OpenBill;

  if (nextStatus === TransactionStatus.OpenBill && session.role !== Role.ADMIN) {
    throw new Error('Only admin can reopen a bill');
  }

  await db
    .update(transactionsTable)
    .set({
      status: nextStatus,
      updatedAt: new Date(),
      updatedBy: session.username,
    })
    .where(eq(transactionsTable.id, id));

  return { ok: true };
}

export async function updateTransactionById(id: string, params: TransactionFormSchema) {
  const session = await verifySession();

  const existing = await db.query.transactionsTable.findFirst({
    where: eq(transactionsTable.id, id),
  });

  if (!existing) {
    throw new Error('Transaction not found');
  }

  if (!params.items.length) {
    throw new Error('Items are required');
  }

  const items = await getItems({
    ids: params.items.map((e) => e.id),
    isActive: true,
  });

  const itemsById = new Map(items.map((e) => [e.id, e.price]));

  const subtotal = params.items.reduce((total, item) => {
    const price = itemsById.get(item.id);
    if (!price) throw new Error('Item not found');

    return total + item.quantity * Number(price);
  }, 0);

  const voucherId = params.voucherId?.trim();
  let discount = 0;
  let appliedVoucherId: string | null = null;

  if (voucherId) {
    const [voucher] = await getVouchers({ ids: [voucherId], isActive: true });
    if (!voucher) {
      throw new Error('Voucher not found');
    }
    discount = Math.max(0, Math.min(100, Number(voucher.percentage ?? 0)));
    appliedVoucherId = voucher.id;
  }

  const total = Math.max(0, subtotal - (subtotal * discount) / 100);

  await db.transaction(async (tx) => {
    await tx
      .update(transactionsTable)
      .set({
        customer: params.customer,
        method: params.method,
        total: total.toString(),
        voucherId: appliedVoucherId,
        updatedAt: new Date(),
        updatedBy: session.username,
      })
      .where(eq(transactionsTable.id, id));

    await tx
      .delete(transactionItemsTable)
      .where(eq(transactionItemsTable.transactionId, id));

    await tx.insert(transactionItemsTable).values(
      params.items.map((e) => ({
        itemId: e.id,
        transactionId: id,
        quantity: e.quantity,
        createdAt: new Date(),
        createdBy: session.username,
        updatedAt: new Date(),
        updatedBy: session.username,
      })),
    );
  });

  return { ok: true };
}
