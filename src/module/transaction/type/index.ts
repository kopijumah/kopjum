import type { FieldArrayWithId } from 'react-hook-form';
import type { getItems } from '~/module/menu/action';
import type { getVouchers } from '~/module/voucher/action';
import type { TransactionFormSchema } from '../schema';

export type TransactionFormValues = TransactionFormSchema;

export type MenuItem = Awaited<ReturnType<typeof getItems>>[number];
export type Voucher = Awaited<ReturnType<typeof getVouchers>>[number];

export type TransactionItemField = FieldArrayWithId<
  TransactionFormValues,
  'items',
  'fieldKey'
>;
