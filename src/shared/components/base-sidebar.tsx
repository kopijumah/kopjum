"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AnalyticsUpIcon,
  DocumentAttachmentIcon,
  Wallet03Icon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/shared/ui/sidebar"
import { useAuth } from "~/module/auth/hook/use-auth"
import { Role } from "~/shared/enum"

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
]

type BaseSidebarLayoutProps = {
  children: React.ReactNode
}

function BaseSidebarLayout({ children }: BaseSidebarLayoutProps) {
  const pathname = usePathname()
  const auth = useAuth()

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar">
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
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}

export { BaseSidebarLayout }
