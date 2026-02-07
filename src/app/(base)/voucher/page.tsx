import { redirect } from 'next/navigation';
import VoucherModule from '~/module/voucher/components/voucher-module';
import { Role } from '~/shared/enum';
import { verifySession } from '~/shared/session';

export default async function Page() {
  const session = await verifySession();
  if (session.role !== Role.ADMIN) {
    redirect('/transaction')
  }

  return (
    <div className="flex w-full justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <VoucherModule />
      </div>
    </div>
  );
}
