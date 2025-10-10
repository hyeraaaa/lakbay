"use client"

import { Button } from "@/components/ui/button"
import { User, LogOut, Home, Car } from "lucide-react"
import Link from "next/link"
import { User as UserType } from "@/lib/jwt"
import { MessageCircle } from "lucide-react"

interface MobileAuthSectionProps {
  mounted: boolean
  isLoading: boolean
  isLoggingOut: boolean
  isAuthenticated: boolean
  user: UserType
  getDashboardRoute: (userType: string) => string
  setIsMenuOpen: (open: boolean) => void
  handleLogout: () => void
}

const MobileAuthSection = ({
  mounted,
  isLoading,
  isLoggingOut,
  isAuthenticated,
  user,
  getDashboardRoute,
  setIsMenuOpen,
  handleLogout,
}: MobileAuthSectionProps) => {
  if (!mounted) {
    return null
  }

  if (isLoading || isLoggingOut) {
    return null
  }

  if (isAuthenticated && user) {
    return (
      <div className="space-y-6">
        <div className="pb-6 border-b border-gray-200">
          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          <p className="text-sm text-gray-500 capitalize mt-1">{user.user_type}</p>
        </div>


        <div className="space-y-4">
          <Link href={getDashboardRoute(user.user_type)}>
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start text-lg py-6 transition-all duration-200 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/chat">
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start text-lg py-6 transition-all duration-200 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageCircle className="h-5 w-5 mr-3" />
              Chat
            </Button>
          </Link>

          <Link href={`/profile/${user.id}`}>
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start text-lg py-6 transition-all duration-200 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-5 w-5 mr-3" />
              Profile
            </Button>
          </Link>

          <Link href="/user/become-a-host">
            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-start text-lg py-6 transition-all duration-200 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <Car className="h-5 w-5 mr-3" />
              Become a Host
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start text-lg py-6 transition-all duration-200 hover:bg-red-50 text-red-600"
            onClick={() => {
              handleLogout()
              setIsMenuOpen(false)
            }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    )
  }

  // Not authenticated - show Sign In button
  return (
    <div className="pt-6">
      <Link href="/login">
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-center text-lg py-6 transition-all duration-200 hover:bg-gray-100 bg-transparent"
        >
          Sign in
        </Button>
      </Link>
    </div>
  )
}

export default MobileAuthSection
