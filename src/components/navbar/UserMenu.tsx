import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, Home, Car, Calendar, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/confirmation-dialog/confimationDialog";
import { encodeId } from "@/lib/idCodec";
import { User as UserType } from "@/lib/jwt";

interface UserMenuProps {
  user: UserType;
  fullName: string;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (open: boolean) => void;
  getProfilePictureUrl: (url: string | null | undefined) => string | undefined;
  getDashboardRoute: (userType: string) => string;
  handleLogout: () => void;
}

const showProfileLink = (userType: string) => {
  return userType === 'owner'
}

const UserMenu = ({
  user,
  fullName,
  isUserMenuOpen,
  setIsUserMenuOpen,
  getProfilePictureUrl,
  getDashboardRoute,
  handleLogout,
}: UserMenuProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  return (
    <div className="relative">
      {/* User Menu Button */}
      <Button
        variant="ghost"
        size="default"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="flex items-center space-x-2 hover:bg-gray-100"
      >
        <Avatar className="h-6 w-6">
          <AvatarImage 
            src={getProfilePictureUrl(user.profile_picture)} 
            alt={`${user.first_name} ${user.last_name}`}
          />
          <AvatarFallback className="text-xs">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline">{fullName}</span>
        <span className="sm:hidden">Profile</span>
      </Button>

      {/* User Dropdown Menu */}
      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-50 border border-border user-menu">
          <div className="px-6 py-4 border-b border-border flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={getProfilePictureUrl(user.profile_picture)} 
                alt={`${user.first_name} ${user.last_name}`}
              />
              <AvatarFallback className="text-sm">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-medium text-gray-900">{fullName}</p>
              <p className="text-sm text-gray-500 capitalize">{user.user_type}</p>
            </div>
          </div>
          
          <Link href={getDashboardRoute(user.user_type)}>
            <button
              className="w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-gray-100 flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>{(user.user_type === 'owner' || user.user_type === 'admin') ? 'Dashboard' : 'Home'}</span>
            </button>
          </Link>
          
          {showProfileLink(user.user_type) && (
          <Link href={`/profile/${encodeId(String(user.id))}`}>
            <button
              className="w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-gray-100 flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
          </Link>
          )}
          
          <Link href="/user/bookings">
            <button
              className="w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-gray-100 flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Calendar className="h-5 w-5" />
              <span>Bookings</span>
            </button>
          </Link>
          
          <Link href="/settings">
            <button
              className="w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-gray-100 flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </Link>
          
          <Link href="/?openChat=true">
            <button
              className="w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-gray-100 flex items-center space-x-3 cursor-pointer"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Customer Support</span>
            </button>
          </Link>
          
          {user.user_type !== 'owner' && user.user_type !== 'admin' && (
            <Link href="/user/become-a-host">
              <div className="border-t border-border">
                <button
                  className="w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-gray-100 flex items-center space-x-3 cursor-pointer"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Car className="h-5 w-5" />
                  <span>Become a Host</span>
                </button>
              </div>
            </Link>
          )}
          
          <div className="border-t border-border">
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="w-full text-left px-6 py-3 text-base text-red-600 hover:bg-red-50 flex items-center space-x-3 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
      
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Log out?"
        description="You will be signed out from this device."
        confirmText="Log out"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          setIsUserMenuOpen(false);
          handleLogout();
        }}
        onCancel={() => {
          /* no-op */
        }}
      />
    </div>
  );
};

export default UserMenu;
