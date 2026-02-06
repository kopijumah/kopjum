'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/shared/ui/input-group';
import { Skeleton } from '~/shared/ui/skeleton';
import { useAuth } from '~/module/auth/hook/use-auth';
import { getItems } from '../action';
import ItemCard from './item-card';
import ItemCreateTrigger from './item-create-trigger';
import { Role } from '~/shared/enum';
import { useDebounce } from '~/shared/hooks/use-debounce';

const ItemModule = () => {
  const auth = useAuth();
  const isAdmin = auth.user?.role === Role.ADMIN;
  const [keyword, setKeyword] = React.useState('');
  const debouncedKeyword = useDebounce(keyword, 800);

  const itemsQuery = useQuery({
    queryKey: ['items'],
    queryFn: async () =>
      getItems({
        name: debouncedKeyword.trim() ? debouncedKeyword.trim() : undefined,
        isActive: true,
      }),
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  React.useEffect(() => {
    void itemsQuery.refetch();
  }, [debouncedKeyword, itemsQuery.refetch]);

  const items = itemsQuery.data ?? [];

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="sticky top-0 z-10 flex flex-col gap-3 border-b bg-background/95 pb-4 pt-2 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Menu items</h1>
          <p className="text-muted-foreground text-xs/relaxed">
            Manage active menu items and pricing.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <InputGroup className="min-w-60">
            <InputGroupAddon>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search menu"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </InputGroup>
          {isAdmin ? <ItemCreateTrigger /> : null}
        </div>
      </div>
      {itemsQuery.isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {(itemsQuery.error as Error)?.message ?? 'Failed to load items'}
        </div>
      ) : null}
      {itemsQuery.isLoading && !items.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} isAdmin={isAdmin} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
          No menu items found.
        </div>
      )}
    </div>
  );
};

export default ItemModule;
