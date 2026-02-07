'use client';

import * as React from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '~/shared/ui/button';
import KopjumIcon from '~/shared/components/kopjum-icon';
import { formatCurrency } from '~/shared/lib/currency';
import { Separator } from '~/shared/ui/separator';

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
      }
      body {
          -webkit-print-color-adjust: exact;
      }  
    `,
  });

  const { subtotal, discountAmount, grandTotal, hasDiscount } = receipt;
  const computedGrandTotal = hasDiscount ? subtotal - discountAmount : subtotal;
  const displayTotal = Number.isFinite(grandTotal)
    ? grandTotal
    : computedGrandTotal;

  return (
    <div className='relative h-[83dvh] w-full flex flex-col items-center justify-center bg-sidebar rounded-lg gap-y-5 p-3 text-neutral-900'>
      <div className='max-w-xl max-h-full overflow-y-scroll space-y-3 bg-white'>
        <div
          ref={contentRef}
          className='w-[58mm] h-full bg-white flex flex-col items-center p-2 gap-y-1.5'
        >
          <div className='flex aspect-square size-10 overflow-clip items-center justify-center rounded-lg bg-sidebar-primary mt-4'>
            <KopjumIcon className='w-full h-full size-6' />
          </div>
          <p className='text-[0.45rem] font-normal text-center'>Kopi Jumah</p>
          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className='w-full flex flex-col items-center py-2'>
            <p className='text-[0.45rem] font-normal'>Pesanan atas nama</p>
            <p className='text-[0.45rem] font-normal'>{customerName ?? '-'}</p>
          </div>
          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className='w-full flex flex-col py-2'>
            {items.map((e, i) => (
              <div key={i} className='w-full grid grid-cols-5 py-2'>
                <div key={`0-${i}`} className='w-full col-span-1 text-center'>
                  <p className='text-[0.45rem] font-normal'>
                    {e.detail?.quantity ?? 0}
                  </p>
                </div>
                <div key={`1-${i}`} className='w-full col-span-2'>
                  <p className='text-[0.45rem] font-normal'>{e.item?.name ?? '-'}</p>
                </div>
                <div key={`2-${i}`} className='w-full col-span-1'>
                  <p className='text-[0.45rem] font-normal'>
                    {formatCurrency(
                      Number(e.item?.price ?? 0) * Number(e.detail?.quantity ?? 0),
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className='w-full grid grid-cols-5 py-2'>
            <div className='w-full col-span-1 text-center'>
              <p className='text-[0.45rem] font-normal'>Total</p>
            </div>
            <div className='w-full col-span-2'></div>
            <div className='w-full col-span-1'>
              <p className='text-[0.45rem] font-normal'>
                {formatCurrency(displayTotal)}
              </p>
            </div>
          </div>
          <div className="h-[0.1px] w-full bg-gray-500" />
          <div className='max-w-[80%] text-center'>
            <p className='text-[0.45rem] font-normal'>
              Terima kasih kerana berkunjung ke Kopi Jumah. Kami berharap anda
              menikmati pengalaman kopi anda bersama kami.
            </p>
          </div>
        </div>
      </div>
      <Button
        className='w-full max-w-xl'
        onClick={() => handlePrint()}
      >
        Print
      </Button>
    </div>
  );
};

export default TransactionReceipt;
