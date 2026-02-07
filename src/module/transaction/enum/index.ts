export const TransactionStatus = {
  OpenBill: 'OPEN_BILL',
  CloseBill: 'CLOSE_BILL',
} as const;

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const PaymentMethod = {
  Qris: 'QRIS',
  Cash: 'CASH',
  Debit: 'DEBIT',
} as const;

export type PaymentMethod =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

const PAYMENT_METHOD_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
] as const;

const formatMethodLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const PAYMENT_METHODS = Object.values(PaymentMethod) as PaymentMethod[];

export const PAYMENT_METHOD_CONFIG = PAYMENT_METHODS.map((method, index) => ({
  value: method,
  label: formatMethodLabel(method),
  color: PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length],
}));
