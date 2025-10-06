"use client"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/jwt"

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const user = getCurrentUser()
  const isOwner = user?.user_type === 'owner'

  const baseTabs = [
    { id: "general", label: "General" },
    { id: "personal", label: "Personal Info" },
    { id: "security", label: "Security" },
  ]

  const ownerTabs = [
    ...baseTabs,
    { id: "stripe", label: "Stripe Connect" },
  ]

  const tabs = isOwner ? ownerTabs : baseTabs
  return (
    <div className="border-b bg-background pt-5">
      <div className="flex space-x-1 p-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="flex-1 text-sm"
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
