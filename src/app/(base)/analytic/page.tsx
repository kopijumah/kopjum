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
    <AnalyticModule />
  );
}
