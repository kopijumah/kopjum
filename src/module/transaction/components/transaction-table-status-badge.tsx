import { HugeiconsIcon } from '@hugeicons/react';
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { TransactionStatus } from '../enum';
import { Typography } from '~/shared/ui/text';

const statusConfig = {
  [TransactionStatus.OpenBill]: {
    label: 'Open Bill',
    icon: InformationCircleIcon,
    className: 'bg-amber-500/20',
  },
  [TransactionStatus.CloseBill]: {
    label: 'Close Bill',
    icon: CheckmarkCircle02Icon,
    className: 'bg-green-500/20',
  },
} as const;

type TransactionStatusBadgeProps = {
  status: string | null | undefined;
};

const TransactionStatusBadge = ({ status }: TransactionStatusBadgeProps) => {
  const value = typeof status === 'string' ? status : '';
  const config =
    value === TransactionStatus.OpenBill || value === TransactionStatus.CloseBill
      ? statusConfig[value]
      : null;

  if (!config) {
    return (
      <Typography asChild variant="p2" className="text-inherit capitalize">
        <div>{value || '-'}</div>
      </Typography>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${config.className}`}
    >
      <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-3" />
      {config.label}
    </span>
  );
};

export default TransactionStatusBadge;
