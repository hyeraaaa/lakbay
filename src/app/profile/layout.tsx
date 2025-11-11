"use client"
import { ProtectedRoute } from "@/components/protected-routes/ProtectedRoute"
import { useJWT } from "@/contexts/JWTContext"
import { Sidebar } from "@/components/sidebar-navbar/sidebar"
import { Navbar as DashboardNavbar } from "@/components/sidebar-navbar/navbar"
import { Navbar as CustomerNavbar } from "@/components/navbar"
import { GeneralChatWidget } from "@/components/chat/generalChatwidget"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useJWT()
  const userType = user?.user_type?.toLowerCase()
  const shouldUseSidebar = userType === "admin" || userType === "owner"
  const showNavbar = userType === "customer" || !isAuthenticated

  return (
    <ProtectedRoute requireAuth={false}>
      {shouldUseSidebar ? (
        <>
          <Sidebar />
          <div className="md:pl-16">
            <DashboardNavbar />
            <div className="p-4 pt-6">{children}</div>
          </div>
        </>
      ) : (
        <>
          {showNavbar && <CustomerNavbar />}
          {children}
        </>
      )}
      <GeneralChatWidget />
    </ProtectedRoute>
  )
}


