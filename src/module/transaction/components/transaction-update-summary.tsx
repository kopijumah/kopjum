import { formatCurrency } from '~/shared/lib/currency';

type TransactionUpdateSummaryProps = {
  subtotal: number;
  discountAmount: number;
  total: number;
};

const TransactionUpdateSummary = ({
  subtotal,
  discountAmount,
  total,
}: TransactionUpdateSummaryProps) => {
  return (
    <div className="grid gap-1 rounded-md border bg-primary/10 px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal)}</span>
      </div>
      {discountAmount !== 0 ? (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-medium text-rose-500">
            -{formatCurrency(discountAmount)}
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between border-t pt-2">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default TransactionUpdateSummary;
