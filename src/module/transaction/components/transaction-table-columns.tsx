import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '~/shared/lib/currency';
import { formatDateTime } from '~/shared/lib/time';
import TransactionStatusBadge from './transaction-table-status-badge';
import TransactionTableActions, { type Transaction } from './transaction-table-actions';
import { useToggleTransactionStatus } from '../hook/use-transaction-mutation';

const buildTransactionColumns = (props: {
  isAdmin: boolean;
  toggleTransactionStatus: ReturnType<typeof useToggleTransactionStatus>;
}): ColumnDef<Transaction>[] => [
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('customer')}</div>
    ),
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }) => (
      <div className="uppercase text-muted-foreground">
        {row.getValue('method')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <TransactionStatusBadge status={row.getValue('status')} />
    ),
  },
  {
    accessorKey: 'total',
    header: () => 'Total',
    cell: ({ row }) => (
      <div className="font-bold">{formatCurrency(row.getValue('total'))}</div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {formatDateTime(row.getValue('updatedAt'))}
      </div>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <TransactionTableActions
        transaction={row.original}
        isAdmin={props.isAdmin}
        toggleTransactionStatus={props.toggleTransactionStatus}
      />
    ),
  },
];

export default buildTransactionColumns;
