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
import TransactionCreateItems from './transaction-create-items';
import TransactionCreateSummary from './transaction-create-summary';
import { AlertDialogCancel } from '~/shared/ui/alert-dialog';

type TransactionCreateFormProps = {
  control: Control<TransactionFormValues>;
  register: UseFormRegister<TransactionFormValues>;
  handleSubmit: UseFormHandleSubmit<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void;
  isPending: boolean;
  errorMessage?: string | null;
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

const TransactionCreateForm = ({
  control,
  register,
  handleSubmit,
  errors,
  onSubmit,
  isPending,
  errorMessage,
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
}: TransactionCreateFormProps) => {
  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <AlertDialogHeader>
        <AlertDialogTitle>Create transaction</AlertDialogTitle>
        <AlertDialogDescription>
          This will open a new transaction flow. You can add customer and items
          after creation.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="grid gap-1.5">
        <Label htmlFor="transaction-customer">Customer</Label>
        <Input
          id="transaction-customer"
          placeholder="Customer name"
          aria-invalid={Boolean(errors.customer)}
          disabled={isPending}
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
              disabled={isPending}
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
              disabled={isPending || vouchersLoading}
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
      <TransactionCreateItems
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
        disabled={isPending}
      />
      <TransactionCreateSummary
        subtotal={subtotal}
        discountAmount={discountAmount}
        total={total}
      />
      {errorMessage ? (
        <p className="text-destructive text-sm/relaxed">{errorMessage}</p>
      ) : null}
      <AlertDialogFooter className="sm:grid sm:grid-cols-2 sm:items-center">
        <AlertDialogCancel
          type="button"
          disabled={isPending}
          className="w-full"
        >
          Cancel
        </AlertDialogCancel>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Creating...' : 'Create'}
        </Button>
      </AlertDialogFooter>
    </form>
  );
};

export default TransactionCreateForm;
