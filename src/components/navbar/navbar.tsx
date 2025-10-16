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
import { useState } from "react";

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
  const showNavLinks = pathname.startsWith("/user/vehicle/") && pathname.split("/").length === 4;

  const [active, setActive] = useState("overview");

  const links = [
    { id: "overview", label: "Overview" },
    { id: "reviews", label: "Reviews" },
    { id: "location", label: "Location" },
  ];


  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useClickOutside(isUserMenuOpen, () => setIsUserMenuOpen(false), '.user-menu');

  return (
    <header
      id="app-navbar"
      className={`sticky top-0 z-50 w-full bg-white py-3 px-5 border-b border-gray-300`}
    >
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between relative">
        <Logo />

        {showSearch && (
          <div className="absolute left-1/2 -translate-x-1/2 w-full lg:max-w-2xl">
            <SearchbarSm />
          </div>
        )}

    {showNavLinks && (
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-6">
        {["overview", "reviews", "location"].map((item) => (
          <a
            key={item}
            href={`#${item}`}
            onClick={() => setActive(item)}
            className={`
              relative text-sm font-medium text-gray-700 transition-colors
              hover:text-black
              after:content-[''] after:absolute after:left-0 after:bottom-0
              after:h-[2px] after:w-0 after:bg-black after:transition-all after:duration-300
              hover:after:w-full
              [&.active]:after:w-full [&.active]:after:bg-black
            `}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </a>
        ))}
      </nav>
    )}



        {/* Desktop Navigation */}
        <NavigationMenu>
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
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {showSearch ? (
          <div className="flex items-center gap-2">
            <Logo />
            <div className="flex-1">
              <SearchbarSm />
            </div>
            <div className="flex items-center gap-2">
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
        ) : (
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
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
        )}
      </div>
    </header>
  );
};

export default Navbar;
