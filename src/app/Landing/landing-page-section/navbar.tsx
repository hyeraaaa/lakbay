"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, Settings, Home, Car } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useJWT } from "@/contexts/JWTContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, isAuthenticated, logout, isLoading } = useJWT();

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Avoid hydration flash: don't render auth sections until client mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const getDashboardRoute = (userType: string): string => {
    switch (userType) {
      case 'admin':
        return '/dashboard/admin';
      case 'owner':
        return '/dashboard/owner';
      case 'customer':
      default:
        return '/'; // Redirect customers to landing page
    }
  };

  const renderAuthSection = () => {
    if (!mounted) {
      return null;
    }
    if (isLoading) {
      return null;
    }

    if (isAuthenticated && user) {
      return (
        <div className="relative">
          {/* User Menu Button */}
          <Button
            variant="ghost"
            size="default"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 hover:bg-gray-100"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{fullName}</span>
            <span className="sm:hidden">Profile</span>
          </Button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 user-menu">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
              </div>
              
              <Link href={getDashboardRoute(user.user_type)}>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              </Link>
              
              <Link href="/profile">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
              </Link>
              
              <Link href="/settings">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </Link>
              
              <div className="border-t border-gray-100">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Car className="h-4 w-4" />
                  <span>Become a Host</span>
                </button>
              </div>
              
              <div className="border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Not authenticated - show Sign In button
    return (
      <Link href="/login">
        <Button variant="outline" size="default">
          Sign in
        </Button>
      </Link>
    );
  };

  const renderMobileAuthSection = () => {
    if (!mounted) {
      return null;
    }
    if (isLoading) {
      return null;
    }

    if (isAuthenticated && user) {
      return (
        <div className="space-y-2">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
          </div>
          
          <Link href={getDashboardRoute(user.user_type)}>
            <Button
              variant="ghost"
              size="default"
              className="w-full justify-center transition-all duration-200 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button
              variant="ghost"
              size="default"
              className="w-full justify-center transition-all duration-200 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
          
          <Button
            variant="default"
            size="default"
            className="w-full justify-center transition-all duration-200 hover:scale-105"
            onClick={() => setIsMenuOpen(false)}
          >
            List Your Car
          </Button>
          
          <Button
            variant="ghost"
            size="default"
            className="w-full justify-center transition-all duration-200 hover:bg-red-50 text-red-600"
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      );
    }

    // Not authenticated - show Sign In button
    return (
      <Link href="/login">
        <Button
          variant="outline"
          size="default"
          className="w-full justify-center transition-all duration-200 hover:bg-gray-100"
        >
          Sign in
        </Button>
      </Link>
    );
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white py-3 px-5 ${
        isScrolled ? "border-b border-gray-300" : "border-b-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Image
            src="/logo.png"
            alt="lakbay"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
          <span className="text-2xl text-primary font-medium tracking-[.1em]">
            Lakbay
          </span>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="flex items-center space-x-2">
            <NavigationMenuItem>
              {renderAuthSection()}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 transition-transform duration-200 hover:scale-105"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="relative w-6 h-6">
            <Menu 
              className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out ${
                isMenuOpen 
                  ? "opacity-0 rotate-90 scale-75" 
                  : "opacity-100 rotate-0 scale-100"
              }`} 
            />
            <X 
              className={`absolute inset-0 h-6 w-6 transition-all duration-300 ease-in-out ${
                isMenuOpen 
                  ? "opacity-100 rotate-0 scale-100" 
                  : "opacity-0 -rotate-90 scale-75"
              }`} 
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? "max-h-96 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <div className="py-4 space-y-2">
          {renderMobileAuthSection()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
