'use server';

import { eq } from 'drizzle-orm';
import { db } from '~/shared/db';
import { itemsTable } from '~/shared/db/schema';
import { verifySession } from '~/shared/session';
import type { ItemFormSchema } from '../schema';

const normalizePrice = (value: unknown) => {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    throw new Error('Invalid price');
  }
  return amount;
};

type UpdateItemParams = {
  id: string;
  data: ItemFormSchema;
};

export async function createItem(data: ItemFormSchema) {
  const session = await verifySession();
  const price = normalizePrice(data.price);
  const now = new Date();

  const [item] = await db
    .insert(itemsTable)
    .values({
      name: data.name.trim(),
      price: price.toString(),
      type: data.type,
      category: data.category,
      createdAt: now,
      createdBy: session.username,
      updatedAt: now,
      updatedBy: session.username,
    })
    .returning();

  return item;
}

export async function updateItem({ id, data }: UpdateItemParams) {
  const session = await verifySession();
  const current = await db.query.itemsTable.findFirst({
    where: eq(itemsTable.id, id),
  });
  if (!current) {
    throw new Error('Item not found');
  }

  const nextPrice = normalizePrice(data.price);
  const currentPrice = Number(current.price ?? 0);
  const now = new Date();

  if (Number.isFinite(currentPrice) && nextPrice !== currentPrice) {
    return await db.transaction(async (tx) => {
      const [nextItem] = await tx
        .insert(itemsTable)
        .values({
          name: data.name.trim(),
          price: nextPrice.toString(),
          type: data.type,
          category: data.category,
          createdAt: now,
          createdBy: session.username,
          updatedAt: now,
          updatedBy: session.username,
        })
        .returning();

      await tx
        .update(itemsTable)
        .set({
          isActive: false,
          updatedAt: now,
          updatedBy: session.username,
        })
        .where(eq(itemsTable.id, id));

      return nextItem;
    });
  }

  const [item] = await db
    .update(itemsTable)
    .set({
      name: data.name.trim(),
      type: data.type,
      category: data.category,
      updatedAt: now,
      updatedBy: session.username,
    })
    .where(eq(itemsTable.id, id))
    .returning();

  if (!item) {
    throw new Error('Failed to update item');
  }

  return item;
}

export async function disableItemById(id: string) {
  const session = await verifySession();
  const now = new Date();

  const [item] = await db
    .update(itemsTable)
    .set({
      isActive: false,
      updatedAt: now,
      updatedBy: session.username,
    })
    .where(eq(itemsTable.id, id))
    .returning({ id: itemsTable.id });

  if (!item) {
    throw new Error('Item not found');
  }

  return item;
}
