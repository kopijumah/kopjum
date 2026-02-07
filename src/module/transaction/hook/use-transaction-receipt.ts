'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactionById } from '../action';

type ReceiptItem = {
  detail?: { quantity?: number | null } | null;
  item?: { name?: string | null; price?: number | string | null } | null;
};

type UseTransactionReceiptParams = {
  transactionId: string;
  enabled?: boolean;
};

export const useTransactionReceipt = ({
  transactionId,
  enabled = true,
}: UseTransactionReceiptParams) => {
  const transactionQuery = useQuery({
    queryKey: ['transaction', 'print', transactionId],
    queryFn: async () => getTransactionById(transactionId),
    enabled,
  });

  const items = (transactionQuery.data?.items ?? []) as ReceiptItem[];
  const total = Number(transactionQuery.data?.transaction?.total ?? 0);

  const receipt = React.useMemo(() => {
    const subtotal = items.reduce((sum, entry) => {
      const price = Number(entry.item?.price ?? 0);
      const quantity = Number(entry.detail?.quantity ?? 0);
      return sum + price * quantity;
    }, 0);
    const discountAmount = Math.max(0, subtotal - Number(total ?? 0));
    const grandTotal = Math.max(0, Number(total ?? 0));

    return {
      subtotal,
      discountAmount,
      grandTotal,
      hasDiscount: discountAmount > 0,
    };
  }, [items, total]);

  return {
    transaction: transactionQuery.data?.transaction,
    items,
    isLoading: transactionQuery.isLoading,
    receipt,
  };
};
