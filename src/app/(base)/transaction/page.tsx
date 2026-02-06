import TransactionTable from '~/module/transaction/components/transaction-table';

export default function Page() {
  return (
    <div className="flex h-screen w-full justify-center overflow-hidden px-4 py-6 ">
      <div className="flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <TransactionTable />
      </div>
    </div>
  );
}
