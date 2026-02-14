"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AnalyticsUpIcon,
  Coupon02Icon,
  DocumentAttachmentIcon,
  Logout01Icon,
  Wallet03Icon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "~/shared/ui/sidebar"
import { useAuth } from "~/module/auth/hook/use-auth"
import { Role } from "~/shared/enum"
import KopjumIcon from "~/shared/components/kopjum-icon"
import { Button } from "~/shared/ui/button"

type MenuItem = {
  title: string
  href: string
  icon: typeof Wallet03Icon
  roles?: Role[]
}

const menuItems: MenuItem[] = [
  {
    title: "Transaction",
    href: "/transaction",
    icon: Wallet03Icon,
    roles: [Role.ADMIN, Role.WAITERS],
  },
  {
    title: "Analytic",
    href: "/analytic",
    icon: AnalyticsUpIcon,
    roles: [Role.ADMIN],
  },
  {
    title: "Menu",
    href: "/menu",
    icon: DocumentAttachmentIcon,
    roles: [Role.ADMIN, Role.WAITERS],
  },
  {
    title: "Voucher",
    href: "/voucher",
    icon: Coupon02Icon,
    roles: [Role.ADMIN],
  },
]

type BaseSidebarLayoutProps = {
  children: React.ReactNode
}

function BaseSidebarLayout({ children }: BaseSidebarLayoutProps) {
  const pathname = usePathname()
  const auth = useAuth()

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="offcanvas">
        <SidebarHeader className="h-16">
          <Link
            href="/transaction"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-sidebar-foreground"
          >
            <KopjumIcon className="size-8" />
            <div className="flex flex-col justify-start items-start">
              <div className="tracking-tight text-sm">Kopjum</div>
              <div className="text-xs font-normal">
                By <span className="font-bold">Teman Duta</span>
              </div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel></SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  if (
                    item.roles &&
                    (!auth.user?.role || !item.roles.includes(auth.user.role as Role))
                  ) {
                    return null
                  }

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <HugeiconsIcon
                            icon={item.icon}
                            strokeWidth={2}
                            className="size-4"
                          />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex items-center gap-3 rounded-md px-2 py-2 w-full">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-sidebar-foreground">
                  {auth.isLoading
                    ? "Loading user..."
                    : auth.user
                      ? auth.user.username
                      : "Unknown user"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {auth.isLoading ? "Checking role..." : auth.user?.role ?? "No role"}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-fit justify-start gap-2 text-sm"
              disabled={auth.logoutMutation.isPending}
              onClick={() => auth.logoutMutation.mutate()}
            >
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="bg-sidebar/90 backdrop-blur supports-backdrop-blur:bg-background/60 sticky top-0 z-20 flex h-16 items-center gap-2 border-b px-3">
          <SidebarTrigger className="shrink-0" />
        </div>
        <div className="w-full flex flex-col max-w-6xl mx-auto mt-8 mb-6 px-5">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { BaseSidebarLayout }
