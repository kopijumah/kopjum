'use server';

import { and, eq, ilike, inArray, type SQL } from 'drizzle-orm';
import { db } from '~/shared/db';
import { itemsTable } from '~/shared/db/schema';
import { verifySession } from '~/shared/session';

type Params = {
  ids?: string[];
  name?: string;
  isActive?: boolean;
};

export async function getItems(params: Params) {
  await verifySession();

  const conditions: SQL<unknown>[] = [];
  if (params.ids && params.ids.length > 0) {
    conditions.push(inArray(itemsTable.id, params.ids));
  }
  if (params.name && params.name.trim() !== '') {
    conditions.push(ilike(itemsTable.name, `%${params.name}%`));
  }
  if (typeof params.isActive === 'boolean') {
    conditions.push(eq(itemsTable.isActive, params.isActive));
  }

  return await db.query.itemsTable.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: (itemsTable, { desc }) => [desc(itemsTable.updatedAt)],
  });
}
