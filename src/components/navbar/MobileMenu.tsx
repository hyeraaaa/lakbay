"use client"

import { Menu, X } from "lucide-react"
import MobileAuthSection from "./MobileAuthSection"
import { User as UserType } from "@/lib/jwt"

interface MobileMenuProps {
  isMenuOpen: boolean
  setIsMenuOpen: (open: boolean) => void
  mounted: boolean
  isLoading: boolean
  isLoggingOut: boolean
  isAuthenticated: boolean
  user: UserType
  getDashboardRoute: (userType: string) => string
  handleLogout: () => void
}

const MobileMenu = ({
  isMenuOpen,
  setIsMenuOpen,
  mounted,
  isLoading,
  isLoggingOut,
  isAuthenticated,
  user,
  getDashboardRoute,
  handleLogout,
}: MobileMenuProps) => {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden p-2 transition-transform duration-200 hover:scale-105 relative z-50"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <Menu
            className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out ${
              isMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
            }`}
          />
          <X
            className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out ${
              isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
            }`}
          />
        </div>
      </button>

      {/* Fullscreen Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "transform translate-x-0" : "transform translate-x-full"
        }`}
      >
        {/* Menu Content Container */}
        <div className="flex flex-col h-full pt-20 px-6">
          {!mounted || isLoading ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <MobileAuthSection
              mounted={mounted}
              isLoading={isLoading}
              isLoggingOut={isLoggingOut}
              isAuthenticated={isAuthenticated}
              user={user}
              getDashboardRoute={getDashboardRoute}
              setIsMenuOpen={setIsMenuOpen}
              handleLogout={handleLogout}
            />
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}

export default MobileMenu
