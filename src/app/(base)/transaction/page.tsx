import * as React from 'react';
import TransactionTable from '~/module/transaction/components/transaction-table';

export default function Page() {
  return (
    <React.Suspense
      fallback={
        <div className="text-muted-foreground text-sm">
          Loading transactions...
        </div>
      }
    >
      <TransactionTable />
    </React.Suspense>
  );
}
