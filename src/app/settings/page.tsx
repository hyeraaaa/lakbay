"use client"

import { useState, useEffect } from "react"
import { SettingsSidebar } from "@/components/test-settings/settingsSidebar"
import { SettingsTabs } from "@/components/test-settings/settingsTab"
import { GeneralSettings } from "@/components/test-settings/generalSettings"
import { PersonalSettings } from "@/components/test-settings/personalSettings"
import { SecuritySettings } from "@/components/test-settings/securitySettings"
import { StripeConnectSettings } from "@/components/test-settings/stripeConnectSettings"
import { GarageLocationSettings } from "@/components/test-settings/garageLocationSettings"
import { NotificationProvider } from "@/components/NotificationProvider"
import { ProtectedRoute } from "@/components/protected-routes/ProtectedRoute"
import { getCurrentUser } from "@/lib/jwt"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  // Check if user is an owner
  const user = getCurrentUser()
  const isOwner = user?.user_type === 'owner'
  const isCustomer = user?.user_type === 'customer'
  const isAdmin = user?.user_type === 'admin'

  // const containerClass = `mx-auto${isAdmin || isOwner ? '' : ' max-w-7xl py-5'}`

  // Redirect non-owners away from stripe tab
  useEffect(() => {
    if ((activeTab === "stripe" || activeTab === "garage") && !isOwner) {
      setActiveTab("general")
    }
  }, [activeTab, isOwner])

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />
      case "personal":
        return <PersonalSettings />
      case "security":
        return <SecuritySettings />
      case "garage":
        return isOwner ? <GarageLocationSettings /> : <GeneralSettings />
      case "stripe":
        return isOwner ? <StripeConnectSettings /> : <GeneralSettings />
      default:
        return <GeneralSettings />
    }
  }

  return (
    <NotificationProvider>
      <ProtectedRoute requireAuth={true}>
      <div>
        <div className="mx-auto max-w-7xl py-5">
          <div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
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
      </ProtectedRoute>
    </NotificationProvider>
  )
}
