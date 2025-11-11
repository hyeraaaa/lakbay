"use client"

import { cn } from "@/lib/utils"
import { User, UserCircle, Shield, CreditCard, MapPin, type LucideIcon } from "lucide-react"
import { getCurrentUser } from "@/lib/jwt"

interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
}

interface SettingsSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const user = getCurrentUser()
  const isOwner = user?.user_type === 'owner'

  const baseSidebarItems: SidebarItem[] = [
    { id: "general", label: "General", icon: User },
    { id: "personal", label: "Personal Info", icon: UserCircle },
    { id: "security", label: "Security", icon: Shield },
  ]

  const ownerSidebarItems: SidebarItem[] = [
    ...baseSidebarItems,
    { id: "garage", label: "Garage Location", icon: MapPin },
    { id: "stripe", label: "Stripe Connect", icon: CreditCard },
  ]

  const sidebarItems = isOwner ? ownerSidebarItems : baseSidebarItems
  return (
    <div className="w-64 p-6">
      <nav className="space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
