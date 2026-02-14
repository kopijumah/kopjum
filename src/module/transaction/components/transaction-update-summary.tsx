import { formatCurrency } from '~/shared/lib/currency';
import { Typography } from '~/shared/ui/text';

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
        <Typography
          asChild
          variant="p2"
          className="text-inherit text-muted-foreground"
        >
          <span>Subtotal</span>
        </Typography>
        <Typography asChild variant="p2" className="text-inherit font-medium">
          <span>{formatCurrency(subtotal)}</span>
        </Typography>
      </div>
      {discountAmount !== 0 ? (
        <div className="flex items-center justify-between">
          <Typography
            asChild
            variant="p2"
            className="text-inherit text-muted-foreground"
          >
            <span>Discount</span>
          </Typography>
          <Typography
            asChild
            variant="p2"
            className="text-inherit font-medium text-rose-500"
          >
            <span>-{formatCurrency(discountAmount)}</span>
          </Typography>
        </div>
      ) : null}
      <div className="flex items-center justify-between border-t pt-2">
        <Typography
          asChild
          variant="p2"
          className="text-inherit text-muted-foreground"
        >
          <span>Total</span>
        </Typography>
        <Typography asChild variant="p2" className="text-inherit font-medium">
          <span>{formatCurrency(total)}</span>
        </Typography>
      </div>
    </div>
  );
};

export default TransactionUpdateSummary;
