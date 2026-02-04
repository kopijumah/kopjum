import { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const metadata = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 255 }).default('SYSTEM').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: varchar('updated_by', { length: 255 }).default('SYSTEM').notNull(),
};

export const usersTable = pgTable(
  'users',
  {
    id: uuid().defaultRandom().primaryKey(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: varchar('role', { length: 40 }).notNull(),
    ...metadata,
  },
  (t) => [index('idx_username').on(t.username)],
);
export type User = InferSelectModel<typeof usersTable>;

export const itemsTable = pgTable(
  'items',
  {
    id: uuid().defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    price: numeric('price', { precision: 10 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ...metadata,
  },
  (t) => [index('idx_is_active').on(t.isActive)],
);

export const transactionsTable = pgTable(
  'transactions',
  {
    id: uuid().defaultRandom().primaryKey(),
    customer: varchar('customer', { length: 255 }).notNull(),
    total: numeric('price', { precision: 10 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    method: varchar('method', { length: 50 }).notNull(),
    ...metadata,
  },
  (t) => [
    index('idx_status').on(t.status),
    index('idx_created_at').on(t.createdAt),
  ],
);

export const transactionItemsTable = pgTable(
  'transaction_items',
  {
    id: uuid().defaultRandom().primaryKey(),
    transactionId: uuid('transaction_id').notNull(),
    itemId: uuid('item_id').notNull(),
    quantity: integer('quantity').default(1).notNull(),
    ...metadata,
  },
  (t) => [index('idx_transaction_id').on(t.transactionId)],
);
