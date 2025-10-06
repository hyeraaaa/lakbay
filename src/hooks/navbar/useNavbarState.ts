import { useState, useEffect } from 'react';

export const useNavbarState = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll detection
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

  return {
    isMenuOpen,
    setIsMenuOpen,
    isScrolled,
    isUserMenuOpen,
    setIsUserMenuOpen,
    mounted
  };
};
