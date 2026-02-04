
import { BaseSidebarLayout } from "~/shared/components/base-sidebar";

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BaseSidebarLayout>{children}</BaseSidebarLayout>
  );
}
