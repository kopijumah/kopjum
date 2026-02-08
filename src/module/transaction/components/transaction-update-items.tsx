import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '~/shared/ui/button';
import { Label } from '~/shared/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '~/shared/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/shared/ui/command';
import { cn } from '~/shared/lib/utils';
import { formatCurrency } from '~/shared/lib/currency';
import type {
  MenuItem,
  TransactionFormValues,
  TransactionItemField,
} from '../type';

type TransactionUpdateItemsProps = {
  items: MenuItem[];
  itemsById: Map<string, MenuItem>;
  itemsLoading: boolean;
  itemPickerOpen: boolean;
  setItemPickerOpen: (open: boolean) => void;
  onAddItem: (itemId: string) => void;
  fields: TransactionItemField[];
  itemsWatch: TransactionFormValues['items'];
  register: UseFormRegister<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
  onDecrease: (index: number) => void;
  onIncrease: (index: number) => void;
  onRemove: (index: number) => void;
  disabled: boolean;
};

const TransactionUpdateItems = ({
  items,
  itemsById,
  itemsLoading,
  itemPickerOpen,
  setItemPickerOpen,
  onAddItem,
  fields,
  itemsWatch,
  register,
  errors,
  onDecrease,
  onIncrease,
  onRemove,
  disabled,
}: TransactionUpdateItemsProps) => {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>Items</Label>
        <Popover open={itemPickerOpen} onOpenChange={setItemPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={itemsLoading || disabled}
            >
              Add item
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end">
            <Command>
              <CommandInput placeholder="Search item" />
              <CommandList>
                <CommandEmpty>
                  {itemsLoading ? 'Loading items...' : 'No items found.'}
                </CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => onAddItem(item.id)}
                    >
                      <span className="flex-1">{item.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(item.price)}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      {fields.length ? (
        <div className="grid gap-2">
          {fields.map((field, index) => {
            const item = itemsById.get(field.id);
            const quantityValue =
              itemsWatch[index]?.quantity ?? field.quantity ?? 1;
            const idField = register(`items.${index}.id`);
            const quantityField = register(`items.${index}.quantity`, {
              valueAsNumber: true,
              min: {
                value: 1,
                message: 'Kuantitas harus lebih besar atau sama dengan 1',
              },
            });
            return (
              <div
                key={field.fieldKey}
                className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-md px-3 py-2"
              >
                <input type="hidden" {...idField} value={field.id} />
                <input
                  type="hidden"
                  {...quantityField}
                  value={quantityValue}
                  readOnly
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item?.name ?? 'Unknown item'}
                  </p>
                  <p className="text-muted-foreground text-[0.625rem]">
                    {formatCurrency(item?.price ?? 0)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    disabled={disabled}
                    onClick={() => onDecrease(index)}
                  >
                    -
                  </Button>
                  <span
                    className={cn(
                      'inline-flex h-6 w-10 items-center justify-center rounded-md border px-1 text-sm',
                      {
                        'border-destructive': Boolean(
                          errors.items?.[index]?.quantity,
                        ),
                      },
                    )}
                  >
                    {quantityValue}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    disabled={disabled}
                    onClick={() => onIncrease(index)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onRemove(index)}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm/relaxed">
          No items selected yet.
        </p>
      )}
      {errors.items?.message ? (
        <p className="text-destructive text-sm/relaxed">
          {errors.items.message}
        </p>
      ) : null}
    </div>
  );
};

export default TransactionUpdateItems;
