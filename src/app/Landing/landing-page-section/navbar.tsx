"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

import Image from "next/image";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              <Link href="/login">
                <Button variant={"ghost"} size={"default"}>
                  Sign in
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant={"default"} size="default">
                Become a Host
              </Button>
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
            ? "max-h-48 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2"
        }`}
      >
        <div className="py-4 space-y-2">
          <Link href="/login">
            <Button
              variant={"ghost"}
              size={"default"}
              className="w-full justify-center transition-all duration-200 hover:bg-gray-100"
            >
              Sign in
            </Button>
          </Link>
          <Button
            variant={"default"}
            size="default"
            className="w-full justify-center transition-all duration-200 hover:scale-105"
          >
            Become a Host
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
