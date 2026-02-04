'use server'

import { verifySession } from "~/shared/session";
import { TransactionFormSchema } from "../schema";
import { db } from "~/shared/db";
import { getItems } from "~/module/menu/action";
import { transactionItemsTable, transactionsTable } from "~/shared/db/schema";
import { TransactionStatus } from "../enum";
import { eq } from "drizzle-orm";

export async function createTransaction(params: TransactionFormSchema) {
  const session = await verifySession();

  const items = await getItems({
    ids: params.items.map((e) => e.id),
    isActive: true,
  });

  const itemsById = new Map(items.map((e) => [e.id, e.price]));

  const total = params.items.reduce((total, item) => {
    const price = itemsById.get(item.id);
    if (!price) throw Error();

    return total + item.quantity * Number(price);
  }, 0);

  return await db.transaction(async (tx) => {
    const [transaction] = await tx
      .insert(transactionsTable)
      .values({
        customer: params.customer,
        method: params.method,
        status: TransactionStatus.OpenBill,
        total: total.toString(),
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
}

export async function closeTransactionById(id: string) {
  const session = await verifySession();

  return await db
    .update(transactionsTable)
    .set({
      status: TransactionStatus.CloseBill,
      updatedAt: new Date(),
      updatedBy: session.username,
    })
    .where(eq(transactionsTable.id, id));
}