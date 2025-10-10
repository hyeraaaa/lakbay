"use client"
import { ProtectedRoute } from "@/components/protected-routes/ProtectedRoute"
import { useJWT } from "@/contexts/JWTContext"
import { Sidebar } from "@/components/sidebar-navbar/sidebar"
import { Navbar as DashboardNavbar } from "@/components/sidebar-navbar/navbar"
import { Navbar as CustomerNavbar } from "@/components/navbar"

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user } = useJWT()
  const userType = user?.user_type?.toLowerCase()
  const shouldUseSidebar = userType === "admin" || userType === "owner"
    const showNavbar = userType === "customer"

  return (
    <ProtectedRoute requireAuth={true}>
      {shouldUseSidebar ? (
        <>
          <Sidebar />
          <div className="md:pl-16">
            <div className="hidden md:block">
              <DashboardNavbar/>
            </div>
            <div className="md:p-4 lg:pt-6">{children}</div>
          </div>
        </>
      ) : (
        <>
        <div className="hidden md:block">
          {showNavbar && <CustomerNavbar />}
          </div>
          {children}
        </>
      )}
    </ProtectedRoute>
  )
}


