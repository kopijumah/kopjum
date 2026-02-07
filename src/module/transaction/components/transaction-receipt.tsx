'use client';

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '~/shared/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from '~/shared/ui/alert-dialog';
import { Skeleton } from '~/shared/ui/skeleton';
import { useTransactionReceipt } from '../hook/use-transaction-receipt';
import KopjumIcon from '~/shared/components/kopjum-icon';

type TransactionReceiptProps = {
  transactionId: string;
  trigger?: React.ReactNode;
};

const formatCurrency = (value: unknown) => {
  const amount = typeof value === 'number' ? value : Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDateTime = (value: unknown) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.valueOf())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const TransactionReceipt = ({
  transactionId,
  trigger,
}: TransactionReceiptProps) => {
  const [open, setOpen] = React.useState(false);
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

  const { transaction, items, isLoading, receipt } = useTransactionReceipt({
    transactionId,
    enabled: open,
  });
  const { subtotal, discountAmount, grandTotal, hasDiscount } = receipt;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? <Button variant="outline">Print</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Receipt</AlertDialogTitle>
        </AlertDialogHeader>
        <div className='max-h-[70dvh] overflow-y-scroll'>
          <div className="rounded-lg border bg-muted/30 p-3 flex items-center justify-center">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : transaction ? (
              <div
                ref={contentRef}
                className="flex w-[58mm] flex-col items-center gap-3 bg-white p-3 text-[0.7rem] text-black"
              >
                <div className="flex flex-col mt-2 items-center justify-center gap-y-1">
                  <div className='flex aspect-square size-10 overflow-clip items-center justify-center rounded-lg bg-sidebar-primary mt-4'>
                    <KopjumIcon />
                  </div>
                  <div className="text-sm font-semibold">Kopjum</div>
                  <div className="text-[0.6rem] text-black">
                    Nota transaksi
                  </div>
                </div>
                <div className="h-[0.1px] w-full bg-gray-500" />
                <div className="flex w-full flex-col items-center gap-1 text-center">
                  <div className="text-[0.6rem] text-black">
                    Pesanan atas nama
                  </div>
                  <div className="text-xs font-semibold">{transaction.customer}</div>
                </div>
                <div className="h-[0.1px] w-full bg-gray-500" />
                <div className="w-full text-[0.65rem]">
                  {items.map((entry, index) => (
                    <div
                      key={`item-${index}`}
                      className="grid grid-cols-7 py-1"
                    >
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
            ) : (
              <div className="text-sm text-black">
                Nota tidak ditemukan.
              </div>
            )}
          </div>
        </div>
        <AlertDialogFooter className="w-full">
          <AlertDialogCancel className="flex-1" variant="outline">
            Close
          </AlertDialogCancel>
          <Button
            className="flex-1"
            onClick={handlePrint}
            disabled={!transaction || isLoading}
          >
            Print
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TransactionReceipt;
