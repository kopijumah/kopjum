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
