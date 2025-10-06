"use client"
import { ProtectedRoute } from "@/components/protected-routes/ProtectedRoute"
import { useJWT } from "@/contexts/JWTContext"
import Navbar from "@/components/navbar/navbar"
import { Sidebar } from "@/components/sidebar-navbar/sidebar"
import { Navbar as DashboardNavbar } from "@/components/sidebar-navbar/navbar"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user } = useJWT()
  const userType = user?.user_type?.toLowerCase()
  const shouldUseSidebar = userType === "admin" || userType === "owner"
  const showNavbar = userType === "customer"

  return (
    <ProtectedRoute requireAuth={true}>
      {showNavbar && <Navbar />}
      {shouldUseSidebar ? (
        <>
          <Sidebar />
          <div className="md:pl-16">
            <DashboardNavbar />
            <div className="p-4 pt-6">{children}</div>
          </div>
        </>
      ) : (
        children
      )}
    </ProtectedRoute>
  )
}


