"use client"

import type React from "react"
import { AppSidebar } from "@/components/sidebar/appSidebar"
import { AppNavbar } from "@/components/sidebar/appNavbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppNavbar />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
