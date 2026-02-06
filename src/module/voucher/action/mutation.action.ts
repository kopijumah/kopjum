'use server';

import { eq } from 'drizzle-orm';
import { db } from '~/shared/db';
import { vouchersTable } from '~/shared/db/schema';
import { verifySession } from '~/shared/session';
import type { VoucherFormSchema } from '../schema';

const normalizePercentage = (value: unknown) => {
  const percentage = typeof value === 'number' ? value : Number(value ?? 0);
  if (!Number.isFinite(percentage)) {
    throw new Error('Invalid voucher percentage');
  }
  return percentage;
};

type UpdateVoucherParams = {
  id: string;
  data: VoucherFormSchema;
};

export async function createVoucher(data: VoucherFormSchema) {
  const session = await verifySession();
  const percentage = normalizePercentage(data.percentage);
  const now = new Date();

  const [voucher] = await db
    .insert(vouchersTable)
    .values({
      name: data.name.trim(),
      percentage: percentage.toString(),
      createdAt: now,
      createdBy: session.username,
      updatedAt: now,
      updatedBy: session.username,
    })
    .returning();

  return voucher;
}

export async function updateVoucher({ id, data }: UpdateVoucherParams) {
  const session = await verifySession();
  const current = await db.query.vouchersTable.findFirst({
    where: eq(vouchersTable.id, id),
  });
  if (!current) {
    throw new Error('Voucher not found');
  }

  const nextPercentage = normalizePercentage(data.percentage);
  const currentPercentage = Number(current.percentage ?? 0);
  const now = new Date();

  if (Number.isFinite(currentPercentage) && nextPercentage !== currentPercentage) {
    return await db.transaction(async (tx) => {
      const [nextVoucher] = await tx
        .insert(vouchersTable)
        .values({
          name: data.name.trim(),
          percentage: nextPercentage.toString(),
          createdAt: now,
          createdBy: session.username,
          updatedAt: now,
          updatedBy: session.username,
        })
        .returning();

      await tx
        .update(vouchersTable)
        .set({
          isActive: false,
          updatedAt: now,
          updatedBy: session.username,
        })
        .where(eq(vouchersTable.id, id));

      return nextVoucher;
    });
  }

  const [voucher] = await db
    .update(vouchersTable)
    .set({
      name: data.name.trim(),
      updatedAt: now,
      updatedBy: session.username,
    })
    .where(eq(vouchersTable.id, id))
    .returning();

  if (!voucher) {
    throw new Error('Failed to update voucher');
  }

  return voucher;
}

export async function disableVoucherById(id: string) {
  const session = await verifySession();
  const now = new Date();

  const [voucher] = await db
    .update(vouchersTable)
    .set({
      isActive: false,
      updatedAt: now,
      updatedBy: session.username,
    })
    .where(eq(vouchersTable.id, id))
    .returning({ id: vouchersTable.id });

  if (!voucher) {
    throw new Error('Voucher not found');
  }

  return voucher;
}
