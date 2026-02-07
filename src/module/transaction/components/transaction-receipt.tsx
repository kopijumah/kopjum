'use client';

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '~/shared/ui/button';
import KopjumIcon from '~/shared/components/kopjum-icon';
import { formatCurrency } from '~/shared/lib/currency';

type TransactionReceiptItem = {
  detail?: { quantity?: number | null } | null;
  item?: { name?: string | null; price?: number | string | null } | null;
};

type TransactionReceiptTotals = {
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  hasDiscount: boolean;
};

type TransactionReceiptProps = {
  transactionId: string;
  customerName: string;
  items: TransactionReceiptItem[];
  receipt: TransactionReceiptTotals;
};

const TransactionReceipt = ({
  transactionId,
  customerName,
  items,
  receipt,
}: TransactionReceiptProps) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `nota-${transactionId}`,
    pageStyle: `
      @media print {
        @page {
          size: 58mm 100mm;
          margin: 0;
        }
      }
      body {
          -webkit-print-color-adjust: exact;
      }  
    `,
  });

  const { subtotal, discountAmount, grandTotal, hasDiscount } = receipt;

  return (
    <div className="flex flex-col items-center h-full w-full max-w-3xl mx-auto justify-center overflow-hidden px-4 py-6 gap-y-4">
      <div className="flex w-full justify-center overflow-auto rounded-lg border bg-muted/30 p-3">
        <div
          ref={contentRef}
          className="flex w-[58mm] flex-col items-center gap-3 bg-white p-3 text-[0.7rem] text-black"
        >
          <div className="w-full flex flex-col mt-2 items-center justify-center gap-y-1">
            <div className="flex aspect-square size-10 overflow-clip items-center justify-center rounded-lg bg-sidebar-primary mt-4">
              <KopjumIcon />
            </div>
            <div className="text-sm font-semibold">Kopjum</div>
            <div className="text-[0.6rem] text-black">Nota transaksi</div>
          </div>
          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className="flex w-full flex-col items-center gap-1 text-center">
            <div className="text-[0.6rem] text-black">
              Pesanan atas nama
            </div>
            <div className="text-xs font-semibold">{customerName}</div>
          </div>
          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className="w-full text-[0.65rem]">
            {items.map((entry, index) => (
              <div key={`item-${index}`} className="grid grid-cols-7 py-1">
                <div className="col-span-1 text-start">
                  {entry.detail?.quantity ?? 0}
                </div>
                <div className="col-span-3">
                  {entry.item?.name ?? 'Item'}
                </div>
                <div className="col-span-3 text-right">
                  {formatCurrency(
                    Number(entry.item?.price ?? 0) *
                    Number(entry.detail?.quantity ?? 0),
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className="grid w-full grid-cols-5 text-[0.65rem]">
            {hasDiscount && (
              <>
                <div className="col-span-2 text-start py-1 text-black">
                  Subtotal
                </div>
                <div className="col-span-3 py-1 text-right font-medium">
                  {formatCurrency(subtotal)}
                </div>
                <div className="col-span-2 text-start py-1 text-black">
                  Diskon
                </div>
                <div className="col-span-3 py-1 text-right font-medium">
                  -{formatCurrency(discountAmount)}
                </div>
              </>
            )}
            <div className="col-span-2 text-start py-1 text-[0.7rem] font-semibold">
              Total
            </div>
            <div className="col-span-3 py-1 text-right text-[0.7rem] font-semibold">
              {formatCurrency(grandTotal)}
            </div>
          </div>

          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className="text-center text-[0.6rem] text-black">
            Terima kasih atas kunjungan Anda.
          </div>
        </div>
      </div>
      <Button
        onClick={handlePrint}
        className='w-full'
      >
        Print
      </Button>
    </div>
  );
};

export default TransactionReceipt;
