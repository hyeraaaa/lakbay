"use client"

import * as React from "react"
import { Home, Settings, User, ShieldCheck, Users, MessageSquare, Calendar } from "lucide-react"

import { NavMain } from "@/components/sidebar/navMain"
// import { NavProjects } from "@/components/sidebar/navProjects"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import Image from "next/image"
import { useNavbarAuth } from "@/hooks/navbar"
import { encodeId } from "@/lib/idCodec"

const getNavItemsByRole = (userType?: string) => {
  const isAdmin = userType?.toLowerCase() === "admin"
  if (isAdmin) {
    return [
      { title: "Dashboard", url: "/admin", icon: Home },
      { title: "Verification Requests", url: "/admin/verification-requests", icon: ShieldCheck },
      { title: "Chat", url: "/admin/chat", icon: MessageSquare },
      { title: "Profile", url: `/profile/${typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}')?.id ? encodeId(String(JSON.parse(localStorage.getItem('user') || '{}')?.id)) : '') : ''}` , icon: User },
      { title: "Account Management", url: "/admin/users", icon: Users },
      { title: "Settings", url: "/settings", icon: Settings },
    ]
  }
  return [
    { title: "Dashboard", url: "/owner", icon: Home },
    { title: "Bookings", url: "/owner/bookings", icon: Calendar },
    { title: "Profile", url: `/profile/${typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || '{}')?.id ? encodeId(String(JSON.parse(localStorage.getItem('user') || '{}')?.id)) : '') : ''}` , icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useNavbarAuth()
  const navMain = React.useMemo(() => getNavItemsByRole(user?.user_type), [user?.user_type])
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="sticky top-[calc(var(--banner-offset,0px)+0px)] z-30 bg-background">
        <div className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-1">
          {/* Expanded logo */}
          <Image
            src="/logo.png"
            alt="Lakbay"
            width={35}
            height={35}
            className="block group-data-[collapsible=icon]:hidden"
          />
          {/* Collapsed (icon) logo - larger for visibility */}
          <Image
            src="/logo.png"
            alt="Lakbay"
            width={40}
            height={40}
            className="hidden group-data-[collapsible=icon]:block"
          />
          <span className="text-xl leading-none font-semibold tracking-[.1em] group-data-[collapsible=icon]:hidden">Lakbay</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="w-full flex items-center justify-center gap-2 px-2 py-1 text-xs text-muted-foreground block group-data-[collapsible=icon]:hidden">
          <span>© Lakbay {new Date().getFullYear()}</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
