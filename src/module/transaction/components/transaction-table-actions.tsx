import { MoreHorizontalCircle01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '~/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/shared/ui/dropdown-menu';
import TransactionUpdate from './transaction-update';
import { TransactionStatus } from '../enum';
import { useToggleTransactionStatus } from '../hook/use-transaction-mutation';
import type { getTransactions } from '../action';

export type Transaction = Awaited<ReturnType<typeof getTransactions>>[number];

type TransactionTableActionsProps = {
  transaction: Transaction;
  isAdmin: boolean;
  toggleTransactionStatus: ReturnType<typeof useToggleTransactionStatus>;
};

const TransactionTableActions = ({
  transaction,
  isAdmin,
  toggleTransactionStatus,
}: TransactionTableActionsProps) => {
  const isOpen = transaction.status === TransactionStatus.OpenBill;
  const canUpdate = isOpen || isAdmin;
  const canClose = isOpen && !toggleTransactionStatus.isPending;
  const canReopen = !isOpen && isAdmin && !toggleTransactionStatus.isPending;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-lg" aria-label="Open menu">
            <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(transaction.id)}
          >
            Copy ID
          </DropdownMenuItem>
          {canUpdate ? (
            <TransactionUpdate
              transactionId={transaction.id}
              trigger={
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  Update
                </DropdownMenuItem>
              }
            />
          ) : (
            <DropdownMenuItem disabled>Update (admin only)</DropdownMenuItem>
          )}
          {isOpen ? (
            <DropdownMenuItem
              onClick={() =>
                toggleTransactionStatus.mutate({
                  id: transaction.id,
                  currentStatus: transaction.status as TransactionStatus,
                })
              }
              disabled={!canClose}
            >
              Close bill
            </DropdownMenuItem>
          ) : isAdmin ? (
            <DropdownMenuItem
              onClick={() =>
                toggleTransactionStatus.mutate({
                  id: transaction.id,
                  currentStatus: transaction.status as TransactionStatus,
                })
              }
              disabled={!canReopen}
            >
              Open bill
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href={`/transaction/${transaction.id}`}>Print</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TransactionTableActions;
