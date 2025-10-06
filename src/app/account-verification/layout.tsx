"use client"
import { ProtectedRoute } from "@/components/protected-routes/ProtectedRoute"
import { useJWT } from "@/contexts/JWTContext"
import { LayoutWrapper } from "@/components/sidebar/layoutWrapper"
import Navbar from "@/components/navbar/navbar"
import { NotificationProvider } from "@/components/NotificationProvider"
import { Sidebar } from "@/components/sidebar-navbar/sidebar"
import { Navbar as SidebarNavbar } from "@/components/sidebar-navbar/navbar"

export default function AccountVerificationLayout({ children }: { children: React.ReactNode }) {
  const { user } = useJWT()
  const userType = user?.user_type?.toLowerCase()
  const shouldUseSidebar = userType === "admin" || userType === "owner"
  const showNavbar = userType === "customer"

  return (
    <ProtectedRoute requireAuth={true}>
      <NotificationProvider>
        {shouldUseSidebar ? (
          <>
            <Sidebar />
            <div className="md:pl-16">
              <SidebarNavbar />
              <div className="p-4 pt-6">{children}</div>
            </div>
          </>
        ) : (
          <>
            {showNavbar && <Navbar />}
            {children}
          </>
        )}
      </NotificationProvider>
    </ProtectedRoute>
  )
}