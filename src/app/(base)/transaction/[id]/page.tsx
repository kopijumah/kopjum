'use client';

import { useParams } from 'next/navigation';
import TransactionReceipt from '~/module/transaction/components/transaction-receipt';
import { useTransactionReceipt } from '~/module/transaction/hook/use-transaction-receipt';
import { Skeleton } from '~/shared/ui/skeleton';

export default function Page() {
  const params = useParams<{ id?: string }>();
  const transactionId = typeof params?.id === 'string' ? params.id : '';
  const { transaction, items, isLoading, receipt } = useTransactionReceipt({
    transactionId,
    enabled: Boolean(transactionId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center h-full w-full justify-center overflow-hidden px-4 py-6">
        <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold leading-none">Receipt</h2>
              <p className="text-muted-foreground text-sm">
                Transaction ID: {transactionId}
              </p>
            </div>
          </div>
          <div className="flex h-fit justify-center overflow-auto rounded-lg border bg-muted/30 p-3">
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center h-full w-full justify-center overflow-hidden px-4 py-6">
        <div className="flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold leading-none">Receipt</h2>
              <p className="text-muted-foreground text-sm">
                Transaction ID: {transactionId}
              </p>
            </div>
          </div>
          <div className="flex h-fit justify-center overflow-auto rounded-lg border bg-muted/30 p-3">
            <div className="text-sm text-black">Nota tidak ditemukan.</div>
          </div>
        </div>
      </div>
    );
  }

  const canPrint = Boolean(transaction);

  return (
    <TransactionReceipt
      transactionId={transactionId}
      customerName={transaction.customer ?? ''}
      items={items}
      receipt={receipt}
      canPrint={canPrint}
    />
  );
}
