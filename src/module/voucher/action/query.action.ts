'use server';

import { and, eq, ilike, inArray, type SQL } from 'drizzle-orm';
import { db } from '~/shared/db';
import { vouchersTable } from '~/shared/db/schema';
import { verifySession } from '~/shared/session';

type Params = {
  ids?: string[];
  name?: string;
  isActive?: boolean;
};

export async function getVouchers(params: Params) {
  await verifySession();

  const conditions: SQL<unknown>[] = [];
  if (params.ids && params.ids.length > 0) {
    conditions.push(inArray(vouchersTable.id, params.ids));
  }
  if (params.name && params.name.trim() !== '') {
    conditions.push(ilike(vouchersTable.name, `%${params.name}%`));
  }
  if (typeof params.isActive === 'boolean') {
    conditions.push(eq(vouchersTable.isActive, params.isActive));
  }

  return await db.query.vouchersTable.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: (vouchersTable, { desc }) => [desc(vouchersTable.updatedAt)],
  });
}
