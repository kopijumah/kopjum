'use server';

import { db } from "~/shared/db";
import { LoginSchema } from "../schema";
import { eq } from "drizzle-orm";
import { usersTable } from "~/shared/db/schema";
import { createSession, deleteSession, verifySession } from "~/shared/session";
import { Role } from "~/shared/enum";


export async function login(req: LoginSchema) {
  const record = await db.query.usersTable.findFirst({
    where: eq(usersTable.username, req.username),
  });
  if (!record) {
    throw new Error('User not found')
  }
  if (record.password !== req.password) {
    throw new Error('Invalid credential')
  }

  await createSession({
    userId: record.id,
    username: record.username,
    role: record.role as Role,
  });
}

export async function getCurrent() {
  const session = await verifySession();
  const record = await db.query.usersTable.findFirst({
    columns: {
      id: true,
      username: true,
      role: true,
    },
    where: eq(usersTable.id, session.userId),
  });
  if (!record) {
    throw new Error('User not found')
  }

  return record
}

export async function logout() {
  await deleteSession();
}
