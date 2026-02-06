'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/shared/ui/alert-dialog';
import { useDisableItem } from '../hook/use-item-mutation';
import type { getItems } from '../action';

type Item = Awaited<ReturnType<typeof getItems>>[number];

type ItemDisableFormDialogProps = {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ItemDisableFormDialog = ({ item, open, onOpenChange }: ItemDisableFormDialogProps) => {
  const disableItem = useDisableItem();

  const handleConfirm = () => {
    disableItem.mutate(item.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Disable menu</AlertDialogTitle>
          <AlertDialogDescription>
            This will hide "{item.name}" from active menus. You can add it back by creating
            a new item.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={disableItem.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={disableItem.isPending}
            onClick={handleConfirm}
          >
            {disableItem.isPending ? 'Disabling...' : 'Disable'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ItemDisableFormDialog;
