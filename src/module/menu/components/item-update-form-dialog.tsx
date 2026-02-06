'use client';

import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/shared/ui/alert-dialog';
import { Button } from '~/shared/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/shared/ui/input-group';
import { Label } from '~/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/shared/ui/select';
import { useUpdateItem } from '../hook/use-item-mutation';
import { ItemDrinkCategory, ItemFoodCategory, ItemType } from '../enum';
import type { ItemFormSchema } from '../schema';
import type { getItems } from '../action';

type Item = Awaited<ReturnType<typeof getItems>>[number];

type ItemUpdateFormDialogProps = {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const getCategoryOptions = (type: ItemFormSchema['type']) => {
  if (type === ItemType.DRINK) {
    return Object.values(ItemDrinkCategory);
  }
  return Object.values(ItemFoodCategory);
};

const ItemUpdateFormDialog = ({ item, open, onOpenChange }: ItemUpdateFormDialogProps) => {
  const updateItem = useUpdateItem();

  const defaultValues = React.useMemo<ItemFormSchema>(
    () => ({
      name: item.name ?? '',
      price: Number(item.price ?? 0),
      type: (item.type as ItemFormSchema['type']) ?? ItemType.FOOD,
      category: (item.category as ItemFormSchema['category']) ?? ItemFoodCategory.MAIN_COURSE,
    }),
    [item],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ItemFormSchema>({
    defaultValues,
  });

  const typeWatch = useWatch({ control, name: 'type' });
  const categoryWatch = useWatch({ control, name: 'category' });
  const categoryOptions = React.useMemo(
    () => getCategoryOptions(typeWatch ?? ItemType.FOOD),
    [typeWatch],
  );

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [defaultValues, open, reset]);

  React.useEffect(() => {
    if (!categoryOptions.length) return;
    if (categoryWatch && categoryOptions.includes(categoryWatch)) return;
    setValue('category', categoryOptions[0] as ItemFormSchema['category'], {
      shouldValidate: true,
    });
  }, [categoryOptions, categoryWatch, setValue]);

  const onSubmit = (values: ItemFormSchema) => {
    updateItem.mutate(
      { id: item.id, data: values },
      {
        onSuccess: () => {
          reset(values);
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="min-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Update menu</AlertDialogTitle>
          <AlertDialogDescription>
            Update menu details for your customers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor={`menu-update-name-${item.id}`}>Name</Label>
            <InputGroup>
              <InputGroupInput
                id={`menu-update-name-${item.id}`}
                placeholder="Menu name"
                aria-invalid={Boolean(errors.name)}
                disabled={updateItem.isPending}
                {...register('name', {
                  required: 'Nama wajib diisi',
                  minLength: {
                    value: 3,
                    message: 'Nama wajib diisi dan minimal 3 huruf',
                  },
                })}
              />
            </InputGroup>
            {errors.name ? (
              <p className="text-destructive text-xs/relaxed">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`menu-update-price-${item.id}`}>Price</Label>
            <InputGroup>
              <InputGroupAddon>Rp</InputGroupAddon>
              <InputGroupInput
                id={`menu-update-price-${item.id}`}
                type="number"
                min={0}
                step={500}
                placeholder="10000"
                aria-invalid={Boolean(errors.price)}
                disabled={updateItem.isPending}
                {...register('price', {
                  valueAsNumber: true,
                  min: {
                    value: 1000,
                    message: 'Harga minimal Rp 1.000',
                  },
                })}
              />
            </InputGroup>
            {errors.price ? (
              <p className="text-destructive text-xs/relaxed">
                {errors.price.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label>Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as ItemFormSchema['type'])}
                  disabled={updateItem.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ItemType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as ItemFormSchema['category'])}
                  disabled={updateItem.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {updateItem.errorMessage ? (
            <p className="text-destructive text-xs/relaxed">
              {updateItem.errorMessage}
            </p>
          ) : null}
          <AlertDialogFooter className="sm:grid sm:grid-cols-2 sm:items-center">
            <AlertDialogCancel
              type="button"
              disabled={updateItem.isPending}
              className="w-full"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={updateItem.isPending}
              className="w-full"
            >
              {updateItem.isPending ? 'Updating...' : 'Update'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ItemUpdateFormDialog;
