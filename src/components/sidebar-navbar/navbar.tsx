import { Bell, User, LogOut, MessagesSquare, Menu, X, LayoutDashboard, Settings, ShieldCheck, Users as UsersIcon, MessageSquare, Calendar, Car, ScrollText } from "lucide-react"
import { useEffect, useRef, useState, useMemo } from "react"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavbarAuth } from "@/hooks/navbar"
import { useProfilePicture } from "@/hooks/navbar"
import { NotificationPopover } from "@/components/notifications"
import { GeneralChatWidget } from "@/components/chat/generalChatwidget"
import { generalChatService, type GeneralChatMessage } from "@/services/generalChatService"
import { usePathname, useRouter } from "next/navigation"
import { encodeId } from "@/lib/idCodec"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"
import Image from "next/image"
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog"

export function Navbar() {
  const { user, fullName, logout } = useNavbarAuth()
  const { getProfilePictureUrl } = useProfilePicture()
  const isOwner = user?.user_type?.toLowerCase() === "owner"
  const [unreadCount, setUnreadCount] = useState(0)
  const [isGeneralChatOpen, setIsGeneralChatOpen] = useState(false)
  const socketRef = useRef<Socket | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()

  const navigationItems = useMemo(() => {
    const isAdmin = user?.user_type?.toLowerCase() === "admin"
    const profileHref = `/profile/${user?.id ? encodeId(String(user.id)) : ''}`
    if (isAdmin) {
      return [
        { label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
        { label: "Verification Requests", href: "/admin/verification-requests", Icon: ShieldCheck },
        { label: "Logs", href: "/admin/logs", Icon: ScrollText },
        { label: "Chat", href: "/admin/chat", Icon: MessageSquare },
        { label: "Account Management", href: "/admin/account-management", Icon: UsersIcon },
        { label: "Profile", href: profileHref, Icon: User },
        { label: "Settings", href: "/settings", Icon: Settings },
      ]
    }
    return [
      { label: "Dashboard", href: "/owner", Icon: LayoutDashboard },
      { label: "Vehicles", href: "/owner/vehicle", Icon: Car },
      { label: "Bookings", href: "/owner/bookings", Icon: Calendar },
      { label: "Profile", href: profileHref, Icon: User },
      { label: "Settings", href: "/settings", Icon: Settings },
    ]
  }, [user?.user_type, user?.id])

  // Initialize unread count once
  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (!isOwner) return
      const res = await generalChatService.getSessions()
      if (!mounted) return
      if (res.ok && Array.isArray(res.data)) {
        const count = res.data.filter((s) => {
          const last = s.last_message
          if (!last) return false
          return last.user_id !== Number(user?.id) && last.sender === 'user'
        }).length
        setUnreadCount(count)
      } else {
        setUnreadCount(0)
      }
    }
    init()
    return () => { mounted = false }
  }, [isOwner, user?.id])

  // Subscribe to general chat socket for live unread updates
  useEffect(() => {
    if (!isOwner) return
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) return
    const socketUrl = baseUrl.replace(/\/?api\/?$/, '')
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined
    const socket = io(`${socketUrl}/general-chat`, {
      transports: ["websocket"],
      auth: {
        token,
        firstName: user?.first_name,
        lastName: user?.last_name,
        profilePicture: user?.profile_picture,
      },
    })
    socketRef.current = socket

    const handleNewMessage = async (messageData: GeneralChatMessage) => {
      // Only increment if the message is from someone else (customer)
      // and only if the dialog is not currently open
      if (!isGeneralChatOpen && messageData?.user_id && Number(messageData.user_id) !== Number(user?.id)) {
        setUnreadCount((c) => (c >= 99 ? 99 : c + 1))
      }
    }

    const refreshSessions = async () => {
      const res = await generalChatService.getSessions()
      if (res.ok && Array.isArray(res.data)) {
        const count = res.data.filter((s) => {
          const last = s.last_message
          if (!last) return false
          return last.user_id !== Number(user?.id) && last.sender === 'user'
        }).length
        setUnreadCount(count)
      }
    }

    socket.on('new_general_message', handleNewMessage)
    socket.on('new_message', handleNewMessage)
    socket.on('general_message_sent', refreshSessions)

    return () => {
      socket.off('new_general_message', handleNewMessage)
      socket.off('new_message', handleNewMessage)
      socket.off('general_message_sent', refreshSessions)
      socket.close()
      socketRef.current = null
    }
  }, [isOwner, user?.first_name, user?.last_name, user?.profile_picture, user?.id, isGeneralChatOpen])

  // Listen to general chat open/close state to avoid counting while open
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ isOpen: boolean }>
      setIsGeneralChatOpen(!!custom?.detail?.isOpen)
      if (custom?.detail?.isOpen) {
        setUnreadCount(0)
      }
    }
    window.addEventListener('lakbay:general-chat-open-state', handler as EventListener)
    return () => window.removeEventListener('lakbay:general-chat-open-state', handler as EventListener)
  }, [])
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background border-b border-neutral-200">
        <div className="flex h-14 items-center px-6">
          {/* Logo (visible on xs to md screens) */}
          <div className="lg:hidden">
            <Link href="/">
              <Image src="/logo.png" alt="Lakbay" width={112} height={28} className="h-7 w-auto" priority />
            </Link>
          </div>

          {/* Right side - Profile and Notifications and Hamburger */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Right side - Profile and Notifications */}
            <div className="flex items-center gap-2">

             {/* Chat for Owners */}
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 relative hover:bg-primary/10 transition-colors"
                onClick={() => {
                  // On md and smaller screens, go to /chat page instead of opening widget
                  if (isMobile) {
                    setUnreadCount(0)
                    router.push('/chat')
                    return
                  }
                  // On lg and above, open the general chat widget
                  setUnreadCount(0)
                  setTimeout(() => {
                    const event = new CustomEvent('lakbay:open-owner-chat')
                    window.dispatchEvent(event)
                  }, 0)
                }}
                aria-label="Open chat"
              >
                <div className="relative">
                  <MessagesSquare className="h-4 w-4 text-primary" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full text-[10px] leading-4 text-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </div>
              </Button>
            )}

            {/* Notifications */}
            <NotificationPopover />


            {/* Profile Dropdown (hidden on small screens when sidebar is hidden) */}
            <div className="hidden md:block">
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getProfilePictureUrl(user?.profile_picture) || "/profile-avatar.png"} alt={fullName || "Profile"} />
                    <AvatarFallback>{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{fullName || "User"}</p>
                    {user?.email && (
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    router.push('/?openChat=true')
                  }}
                >
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
            </div>

            {/* Hamburger (shows when sidebar is hidden on small screens) */}
            <button
              className="md:hidden p-2 transition-transform duration-200 hover:scale-105 relative z-50"
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
          </div>
        </div>
    </header>
    
    {/* Mobile Menu Overlay for dashboard routes */}
    <div
      className={`md:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out ${
        isMenuOpen ? "transform translate-x-0" : "transform translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full pt-20 px-6">
        {/* User header */}
        {user ? (
          <div className="pb-6 border-b border-gray-200">
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
            <p className="text-sm text-gray-500 capitalize mt-1">{user.user_type}</p>
          </div>
        ) : null}

        {/* Nav buttons styled like MobileMenu */}
        <nav className="space-y-2 mt-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/owner" && pathname?.startsWith(`${item.href}/`))
            const Icon = item.Icon
            return (
              <Link href={item.href} key={item.href} onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="lg"
                  className={`w-full justify-start text-lg py-6 transition-all duration-200 ${
                    isActive ? "bg-gray-100" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div>
          <Button
            variant="ghost"
            size="lg"
            className="w-full justify-start text-lg py-6 transition-all duration-200 hover:bg-red-50 text-red-600"
            onClick={() => {
              setIsMenuOpen(false)
              setIsLogoutDialogOpen(true)
            }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </div>
    {isMenuOpen && (
      <div
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
        onClick={() => setIsMenuOpen(false)}
      />
    )}
    
    {/* General Chat Widget for Owners */}
    {isOwner && <GeneralChatWidget />}
    
    {/* Logout Confirmation Dialog */}
    <ConfirmationDialog
      open={isLogoutDialogOpen}
      onOpenChange={setIsLogoutDialogOpen}
      title="Log out"
      description="Are you sure you want to log out? You'll need to sign in again to access your account."
      confirmText="Log out"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={() => {
        logout()
      }}
    />
    </>
  )
}
