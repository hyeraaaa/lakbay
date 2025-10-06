"use client"

import { useState } from "react"
import { SettingsSidebar } from "@/components/test-settings/settingsSidebar"
import { SettingsTabs } from "@/components/test-settings/settingsTab"
import { GeneralSettings } from "@/components/test-settings/generalSettings"
import { PersonalSettings } from "@/components/test-settings/personalSettings"
import { SecuritySettings } from "@/components/test-settings/securitySettings"
import { NotificationProvider } from "@/components/NotificationProvider"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />
      case "personal":
        return <PersonalSettings />
      case "security":
        return <SecuritySettings />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <NotificationProvider>
      <div className="bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="bg-background px-6 py-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
          </div>

          <div className="md:hidden">
            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="flex">
            <div className="hidden md:block">
              <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="flex-1 p-6">{renderContent()}</div>
          </div>
        </div>
      </div>
    </NotificationProvider>
  )
}
