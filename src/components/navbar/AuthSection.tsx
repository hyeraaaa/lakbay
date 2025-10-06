import { Button } from "@/components/ui/button";
import Link from "next/link";
import UserMenu from "./UserMenu";
import { User as UserType } from "@/lib/jwt";

interface AuthSectionProps {
  mounted: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  user: UserType;
  fullName: string;
  getProfilePictureUrl: (url: string | null | undefined) => string | undefined;
  getDashboardRoute: (userType: string) => string;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const AuthSection = ({
  mounted,
  isLoading,
  isLoggingOut,
  isAuthenticated,
  user,
  fullName,
  getProfilePictureUrl,
  getDashboardRoute,
  isUserMenuOpen,
  setIsUserMenuOpen,
  handleLogout,
}: AuthSectionProps) => {
  if (!mounted) {
    return null;
  }
  
  if (isLoading || isLoggingOut) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <UserMenu
        user={user}
        fullName={fullName}
        isUserMenuOpen={isUserMenuOpen}
        setIsUserMenuOpen={setIsUserMenuOpen}
        getProfilePictureUrl={getProfilePictureUrl}
        getDashboardRoute={getDashboardRoute}
        handleLogout={handleLogout}
      />
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

export default AuthSection;
