import { redirect } from 'next/navigation';
import AnalyticModule from '~/module/analytic/components/analytic-module';
import { Role } from '~/shared/enum';
import { verifySession } from '~/shared/session';

export default async function Page() {
  const session = await verifySession();
  if (session.role !== Role.ADMIN) {
    redirect('/transaction')
  }

  return (
    <div className="flex h-screen w-full justify-center overflow-hidden px-4 py-6">
      <div className="flex min-h-0 w-full max-w-6xl flex-1 flex-col">
        <AnalyticModule />
      </div>
    </div>
  );
}
