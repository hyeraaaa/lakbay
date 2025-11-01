"use client"

import { useEffect, useMemo, useState } from "react"
import { LayoutDashboard, Settings, User, ShieldCheck, Users as UsersIcon, MessageSquare, Calendar, Car, ScrollText, Flag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNavbarAuth } from "@/hooks/navbar"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { encodeId } from "@/lib/idCodec"

type NavItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  openInNewTab?: boolean
}

const getShortLabel = (label: string) => {
  const map: Record<string, string> = {
    "Account Management": "Accounts",
    "Verification Requests": "Verify",
    "Browse Vehicle": "Browse",
  }
  return map[label] ?? label
}

const getNavItemsByRole = (userType?: string, currentUserId?: string): NavItem[] => {
  const isAdmin = userType?.toLowerCase() === "admin"
  if (isAdmin) {
    return [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: ShieldCheck, label: "Verification Requests", href: "/admin/verification-requests" },
      { icon: Flag, label: "Reports", href: "/admin/reports" },
      { icon: Car, label: "Vehicles", href: "/admin/vehicles" },
      { icon: UsersIcon, label: "Account Management", href: "/admin/account-management" },
      { icon: MessageSquare, label: "Chat", href: "/admin/chat" },
      { icon: ScrollText, label: "Logs", href: "/admin/logs" },
      
      { icon: Settings, label: "Settings", href: "/settings" },
    ]
  }
  return [
    { icon: LayoutDashboard, label: "Dashboard", href: "/owner" },
    { icon: Search, label: "Browse Vehicle", href: "/user", openInNewTab: true },
    { icon: Car, label: "Vehicles", href: "/owner/vehicle"},
    { icon: Calendar, label: "Bookings", href: "/owner/bookings" },
    { icon: User, label: "Profile", href: `/profile/${currentUserId ? encodeId(String(currentUserId)) : ''}` },
    { icon: Settings, label: "Settings", href: "/settings" },

  ]
}

export function Sidebar() {
  const { user } = useNavbarAuth()
  const pathname = usePathname()
  const router = useRouter()
  const navigationItems = useMemo(() => getNavItemsByRole(user?.user_type, user?.id), [user?.user_type, user?.id])
  const isRouteActive = (currentPath?: string | null, href?: string) => {
    if (!currentPath || !href) return false
    // Exact match for dashboard roots to avoid overlapping highlight
    if (href === "/admin" || href === "/owner") {
      return currentPath === href
    }
    // Exact match or nested path for non-root items
    return currentPath === href || currentPath.startsWith(`${href}/`)
  }

  // Only render on md and above to avoid mounting on small screens
  const [isMdUp, setIsMdUp] = useState<boolean | null>(null)
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const update = () => setIsMdUp(mql.matches)
    mql.addEventListener('change', update)
    update()
    return () => mql.removeEventListener('change', update)
  }, [])

  if (!isMdUp) return null

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r border-neutral-200 bg-white">
      <div className="flex h-full flex-col items-center py-4">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/logo.png" alt="Lakbay" width={32} height={32} className="rounded" />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-1 flex-col items-center gap-2">
          <TooltipProvider>
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isRouteActive(pathname, item.href)
            const shouldOpenInNewTab = item.openInNewTab

            return (
              <Tooltip key={item.href} delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    {shouldOpenInNewTab ? (
                      <Link 
                        href={item.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-10 w-10 rounded-lg transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                        onClick={() => router.push(item.href)}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    )}
                    <span
                      className={cn(
                        "mt-1 text-[10px] leading-none",
                        active ? "text-sidebar-primary" : "text-muted-foreground",
                      )}
                    >
                      {getShortLabel(item.label)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="py-1 px-2 text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
          </TooltipProvider>
        </nav>
      </div>
    </aside>
  )
}
