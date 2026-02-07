'use client';

import { useParams } from 'next/navigation';
import TransactionReceipt from '~/module/transaction/components/transaction-receipt';
import { useTransactionReceipt } from '~/module/transaction/hook/use-transaction-receipt';

export default function Page() {
  const params = useParams<{ id?: string }>();
  const transactionId = typeof params?.id === 'string' ? params.id : '';
  const { transaction, items, isLoading, receipt } = useTransactionReceipt({
    transactionId,
    enabled: Boolean(transactionId),
  });

  if (isLoading || !transaction) {
    return (
      <div className="flex flex-col items-center h-full w-full justify-center overflow-hidden px-4 py-6">
        loading
      </div>
    );
  }

  return (
    <TransactionReceipt
      transactionId={transactionId}
      customerName={transaction.customer ?? ''}
      items={items}
      receipt={receipt}
    />
  );
}
