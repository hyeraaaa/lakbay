"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { 
  useNavbarState, 
  useProfilePicture, 
  useNavbarAuth, 
  useClickOutside 
} from "@/hooks/navbar";
import Logo from "./Logo";
import AuthSection from "./AuthSection";
import MobileMenu from "./MobileMenu";
import SearchbarSm from "@/components/searchbar-sm";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { usePathname } from "next/navigation";
import type { User } from "@/lib/jwt";
import { MessageCircle } from "lucide-react";

const Navbar = () => {
  const { 
    isMenuOpen, 
    setIsMenuOpen, 
    isScrolled, 
    isUserMenuOpen, 
    setIsUserMenuOpen, 
    mounted 
  } = useNavbarState();
  
  const { getProfilePictureUrl } = useProfilePicture();
  const { 
    user, 
    isAuthenticated, 
    logout, 
    isLoading, 
    isLoggingOut, 
    fullName, 
    getDashboardRoute 
  } = useNavbarAuth();

  const pathname = usePathname();
  const showSearch = pathname === "/user";


  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useClickOutside(isUserMenuOpen, () => setIsUserMenuOpen(false), '.user-menu');

  return (
    <header
      id="app-navbar"
      className={`sticky top-0 z-50 w-full bg-white py-3 px-5 ${
        mounted && isScrolled ? "border-b border-gray-300" : "border-b-0"
      }`}
    >
      <div className="relative flex items-center justify-between">
        <Logo />

        {showSearch && (
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-full max-w-xl px-4">
            <SearchbarSm />
          </div>
        )}

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:block">
          <NavigationMenuList className="flex items-center space-x-2">
            {/* Notification Bell - Only show when authenticated */}
            {mounted && !isLoading && isAuthenticated && (
              <NavigationMenuItem>
                <NotificationPopover />
              </NavigationMenuItem>
            )}

            <NavigationMenuItem>
              {!mounted || isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : (
                <AuthSection
                  mounted={mounted}
                  isLoading={isLoading}
                  isLoggingOut={isLoggingOut}
                  isAuthenticated={isAuthenticated}
                  user={user as User}
                  fullName={fullName}
                  getProfilePictureUrl={getProfilePictureUrl as (url: string | null | undefined) => string | undefined}
                  getDashboardRoute={getDashboardRoute}
                  isUserMenuOpen={isUserMenuOpen}
                  setIsUserMenuOpen={setIsUserMenuOpen}
                  handleLogout={handleLogout}
                />
              )}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2 lg:hidden">
          {showSearch && <SearchbarSm className="w-auto" />}
          {/* Mobile Notification Bell - Only show when authenticated */}
          {mounted && !isLoading && isAuthenticated && (
            <NotificationPopover />
          )}
          
          <MobileMenu
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            mounted={mounted}
            isLoading={isLoading}
            isLoggingOut={isLoggingOut}
            isAuthenticated={isAuthenticated}
            user={user as User}
            getDashboardRoute={getDashboardRoute}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
