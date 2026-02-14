import type { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '~/shared/lib/currency';
import { formatDateTime } from '~/shared/lib/time';
import TransactionStatusBadge from './transaction-table-status-badge';
import TransactionTableActions, { type Transaction } from './transaction-table-actions';
import { useToggleTransactionStatus } from '../hook/use-transaction-mutation';
import { Typography } from '~/shared/ui/text';

const buildTransactionColumns = (props: {
  isAdmin: boolean;
  toggleTransactionStatus: ReturnType<typeof useToggleTransactionStatus>;
}): ColumnDef<Transaction>[] => [
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <Typography asChild variant="p2" className="text-inherit font-medium">
        <div>{row.getValue('customer')}</div>
      </Typography>
    ),
  },
  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }) => (
      <Typography
        asChild
        variant="p2"
        className="text-inherit uppercase text-muted-foreground"
      >
        <div>{row.getValue('method')}</div>
      </Typography>
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
      <Typography asChild variant="p2" className="text-inherit font-bold">
        <div>{formatCurrency(row.getValue('total'))}</div>
      </Typography>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => (
      <Typography
        asChild
        variant="p2"
        className="text-inherit text-muted-foreground"
      >
        <div>{formatDateTime(row.getValue('updatedAt'))}</div>
      </Typography>
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
