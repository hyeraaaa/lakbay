"use client";

import React from "react";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield } from "lucide-react";
import Link from "next/link";
import { useJWT } from "@/contexts/JWTContext";
import { useUserProfile } from "@/hooks/Profile/useProfile";

export const VerificationBanner: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useJWT();
  const { profileData, isLoading: profileLoading } = useUserProfile();

  // Don't show banner if loading, not authenticated, or user doesn't exist
  if (authLoading || profileLoading || !isAuthenticated || !user) {
    return null;
  }

  // Only use API data for verification status
  const isVerified = profileData?.is_verified;

  // If profile data is not loaded yet, don't show banner
  if (profileData === null) {
    return null;
  }

  // Check if user needs verification
  const needsAccountVerification = !isVerified;

  if (!needsAccountVerification) {
    return null;
  }

  return (
    <StickyBanner className="bg-blue-500 text-white">
      <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs sm:text-sm">
          <span className="font-medium">
            Please complete your account verification.
          </span>
          
          <div className="flex items-center gap-1">
            {needsAccountVerification && (
              <Link href="/account-verification">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white text-black border-white hover:bg-gray-100 h-6 px-2 text-xs"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Verify Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </StickyBanner>
  );
};
