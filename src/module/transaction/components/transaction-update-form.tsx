import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '~/shared/ui/alert-dialog';
import { Button } from '~/shared/ui/button';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/ui/select';
import { PaymentMethod } from '../enum';
import type {
  MenuItem,
  TransactionFormValues,
  TransactionItemField,
  Voucher,
} from '../type';
import TransactionUpdateItems from './transaction-update-items';
import TransactionUpdateSummary from './transaction-update-summary';

type TransactionUpdateFormProps = {
  control: Control<TransactionFormValues>;
  register: UseFormRegister<TransactionFormValues>;
  handleSubmit: UseFormHandleSubmit<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void;
  isPending: boolean;
  transactionLoading: boolean;
  errorMessage?: string | null;
  rootErrorMessage?: string | null;
  isLocked: boolean;
  paymentMethods: PaymentMethod[];
  vouchers: Voucher[];
  vouchersLoading: boolean;
  items: MenuItem[];
  itemsById: Map<string, MenuItem>;
  itemsLoading: boolean;
  itemPickerOpen: boolean;
  setItemPickerOpen: (open: boolean) => void;
  onAddItem: (itemId: string) => void;
  fields: TransactionItemField[];
  itemsWatch: TransactionFormValues['items'];
  onDecrease: (index: number) => void;
  onIncrease: (index: number) => void;
  onRemove: (index: number) => void;
  subtotal: number;
  discountAmount: number;
  total: number;
};

const TransactionUpdateForm = ({
  control,
  register,
  handleSubmit,
  errors,
  onSubmit,
  isPending,
  transactionLoading,
  errorMessage,
  rootErrorMessage,
  isLocked,
  paymentMethods,
  vouchers,
  vouchersLoading,
  items,
  itemsById,
  itemsLoading,
  itemPickerOpen,
  setItemPickerOpen,
  onAddItem,
  fields,
  itemsWatch,
  onDecrease,
  onIncrease,
  onRemove,
  subtotal,
  discountAmount,
  total,
}: TransactionUpdateFormProps) => {
  const formDisabled = isPending || isLocked;

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <AlertDialogHeader>
        <AlertDialogTitle>Update transaction</AlertDialogTitle>
        <AlertDialogDescription>
          Update transaction details and items before saving.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="grid gap-1.5">
        <Label htmlFor="transaction-customer">Customer</Label>
        <Input
          id="transaction-customer"
          placeholder="Customer name"
          aria-invalid={Boolean(errors.customer)}
          disabled={formDisabled}
          {...register('customer', {
            required: 'Pelanggan wajib diisi',
            minLength: {
              value: 3,
              message: 'Pelanggan wajib diisi dan minimal 3 huruf',
            },
          })}
        />
        {errors.customer ? (
          <p className="text-destructive text-sm/relaxed">
            {errors.customer.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <Label>Payment method</Label>
        <Controller
          control={control}
          name="method"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value as PaymentMethod)}
              disabled={formDisabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="grid gap-1.5">
        <Label>Voucher</Label>
        <Controller
          control={control}
          name="voucherId"
          render={({ field }) => (
            <Select
              value={field.value ?? ''}
              onValueChange={(value) =>
                field.onChange(value === '__none__' ? '' : value)
              }
              disabled={formDisabled || vouchersLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select voucher (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No voucher</SelectItem>
                {vouchers.map((voucher) => (
                  <SelectItem key={voucher.id} value={voucher.id}>
                    {voucher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <TransactionUpdateItems
        items={items}
        itemsById={itemsById}
        itemsLoading={itemsLoading}
        itemPickerOpen={itemPickerOpen}
        setItemPickerOpen={setItemPickerOpen}
        onAddItem={onAddItem}
        fields={fields}
        itemsWatch={itemsWatch}
        register={register}
        errors={errors}
        onDecrease={onDecrease}
        onIncrease={onIncrease}
        onRemove={onRemove}
        disabled={formDisabled}
      />
      <TransactionUpdateSummary
        subtotal={subtotal}
        discountAmount={discountAmount}
        total={total}
      />
      {errorMessage ? (
        <p className="text-destructive text-sm/relaxed">{errorMessage}</p>
      ) : null}
      {rootErrorMessage ? (
        <p className="text-destructive text-sm/relaxed">
          {rootErrorMessage}
        </p>
      ) : null}
      {isLocked ? (
        <p className="text-muted-foreground text-sm/relaxed">
          This transaction is closed. Only admins can update it.
        </p>
      ) : null}
      <AlertDialogFooter className="sm:grid sm:grid-cols-2 sm:items-center">
        <AlertDialogCancel type="button" disabled={formDisabled} className="w-full">
          Cancel
        </AlertDialogCancel>
        <Button
          type="submit"
          disabled={formDisabled || transactionLoading}
          className="w-full"
        >
          {isPending ? 'Updating...' : 'Update'}
        </Button>
      </AlertDialogFooter>
    </form>
  );
};

export default TransactionUpdateForm;
