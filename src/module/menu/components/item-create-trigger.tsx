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
  AlertDialogTrigger,
} from '~/shared/ui/alert-dialog';
import { Button } from '~/shared/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/shared/ui/input-group';
import { Label } from '~/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/shared/ui/select';
import { useCreateItem } from '../hook/use-item-mutation';
import {
  ItemCategory,
  ItemDrinkCategory,
  ItemFoodCategory,
  ItemType,
} from '../enum';
import type { ItemFormSchema } from '../schema';

const getCategoryOptions = (type: ItemFormSchema['type']): ItemCategory[] => {
  if (type === ItemType.DRINK) {
    return Object.values(ItemDrinkCategory) as ItemCategory[];
  }
  return Object.values(ItemFoodCategory) as ItemCategory[];
};

const ItemCreateTrigger = () => {
  const [open, setOpen] = React.useState(false);
  const createItem = useCreateItem();

  const defaultValues = React.useMemo<ItemFormSchema>(
    () => ({
      name: '',
      price: 1000,
      type: ItemType.FOOD,
      category: ItemFoodCategory.MAIN_COURSE,
    }),
    [],
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
    if (!open) {
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
    createItem.mutate(values, {
      onSuccess: () => {
        reset(defaultValues);
        setOpen(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="lg">Create menu</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Create menu</AlertDialogTitle>
          <AlertDialogDescription>
            Add a new menu item for your customers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1.5">
            <Label htmlFor="menu-name">Name</Label>
            <InputGroup>
              <InputGroupInput
                id="menu-name"
                placeholder="Menu name"
                aria-invalid={Boolean(errors.name)}
                disabled={createItem.isPending}
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
            <Label htmlFor="menu-price">Price</Label>
            <InputGroup>
              <InputGroupAddon>Rp</InputGroupAddon>
              <InputGroupInput
                id="menu-price"
                type="number"
                min={0}
                step={500}
                placeholder="10000"
                aria-invalid={Boolean(errors.price)}
                disabled={createItem.isPending}
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
                  disabled={createItem.isPending}
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
                  disabled={createItem.isPending}
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
          {createItem.errorMessage ? (
            <p className="text-destructive text-xs/relaxed">
              {createItem.errorMessage}
            </p>
          ) : null}
          <AlertDialogFooter className="sm:grid sm:grid-cols-2 sm:items-center">
            <AlertDialogCancel
              type="button"
              disabled={createItem.isPending}
              className="w-full"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={createItem.isPending}
              className="w-full"
            >
              {createItem.isPending ? 'Creating...' : 'Create'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ItemCreateTrigger;
