import TransactionTable from '~/module/transaction/components/transaction-table';

export default function Page() {
  return (
    <div className="flex w-full justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <TransactionTable />
      </div>
    </div>
  );
}
