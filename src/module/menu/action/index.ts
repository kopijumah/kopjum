'use server'

import { and, eq, ilike, inArray } from "drizzle-orm";
import { db } from "~/shared/db";
import { itemsTable } from "~/shared/db/schema";
import { verifySession } from "~/shared/session";

type Params = {
  ids?: string[];
  name?: string;
  isActive?: boolean;
}

export async function getItems(params: Params) {
  await verifySession();

  const conditions = [];
  if (params.ids && params.ids.length > 0) {
    conditions.push(inArray(itemsTable.id, params.ids));
  }
  if (params.name && params.name.trim() !== '') {
    conditions.push(ilike(itemsTable.name, `%${params.name}%`));
  }
  if (params.isActive) {
    conditions.push(eq(itemsTable.isActive, true));
  }

  return await db.query.itemsTable.findMany({
    where: and(...conditions),
    orderBy: (itemsTable, { desc }) => [desc(itemsTable.updatedAt)],
  });
}