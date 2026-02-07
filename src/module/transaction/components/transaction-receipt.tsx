'use client';

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '~/shared/ui/button';
import KopjumIcon from '~/shared/components/kopjum-icon';
import { formatCurrency } from '~/shared/lib/currency';
import { Separator } from '~/shared/ui/separator';
import { PrinterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

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
  customerName,
  items,
  receipt,
}: TransactionReceiptProps) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    pageStyle: `
      @media print {
        @page {
          size: 58mm 100mm;
          margin: 0;
        }
        body {
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  const { subtotal, discountAmount, grandTotal, hasDiscount } = receipt;
  const computedGrandTotal = hasDiscount ? subtotal - discountAmount : subtotal;
  const displayTotal = Number.isFinite(grandTotal)
    ? grandTotal
    : computedGrandTotal;

  return (
    <div className='relative w-full flex flex-col items-center justify-center rounded-lg gap-y-5 p-3 text-neutral-900'>
      <div className='max-w-xl max-h-full overflow-y-scroll'>
        <div
          ref={contentRef}
          className='w-[58mm] bg-white flex flex-col items-center p-3 gap-y-1.5'
        >
          <div className='flex aspect-square size-10 overflow-clip items-center justify-center rounded-lg bg-sidebar-primary mt-4'>
            <KopjumIcon className='w-full h-full size-6' />
          </div>
          <p className='text-[0.75rem] font-normal text-center'>Kopi Jumah</p>
          <div className="h-[0.3px] w-full bg-black" />
          <div className='w-full flex flex-col items-center py-2'>
            <p className='text-[0.75rem] font-normal'>Pesanan atas nama</p>
            <p className='text-[0.75rem] font-normal'>{customerName ?? '-'}</p>
          </div>
          <div className="h-[0.3px] w-full bg-black" />
          <div className='w-full flex flex-col py-2'>
            {items.map((e, i) => (
              <div key={i} className='w-full grid grid-cols-5 py-2'>
                <div key={`0-${i}`} className='w-full col-span-1 text-center'>
                  <p className='text-[0.75rem] font-normal'>
                    {e.detail?.quantity ?? 0}
                  </p>
                </div>
                <div key={`1-${i}`} className='w-full col-span-2'>
                  <p className='text-[0.75rem] font-normal'>{e.item?.name ?? '-'}</p>
                </div>
                <div key={`2-${i}`} className='w-full col-span-1'>
                  <p className='text-[0.75rem] font-normal'>
                    {formatCurrency(
                      Number(e.item?.price ?? 0) * Number(e.detail?.quantity ?? 0),
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-[0.3px] w-full bg-black" />
          <div className='w-full grid grid-cols-5 py-2'>
            <div className='w-full col-span-1 text-center'>
              <p className='text-[0.75rem] font-normal'>Total</p>
            </div>
            <div className='w-full col-span-2'></div>
            <div className='w-full col-span-1'>
              <p className='text-[0.75rem] font-normal'>
                {formatCurrency(displayTotal)}
              </p>
            </div>
          </div>
          <div className="h-[0.3px] w-full bg-black" />
          <div className='max-w-[80%] text-center py-2'>
            <p className='text-[0.75rem] font-normal'>
              Terima kasih kerana berkunjung ke Kopi Jumah.
            </p>
          </div>
        </div>
      </div>
      <Button
        variant='secondary'
        onClick={handlePrint}
      >
        <HugeiconsIcon icon={PrinterIcon} strokeWidth={2} />
      </Button>
    </div>
  );
};

export default TransactionReceipt;
