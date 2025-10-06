import { useJWT } from '@/contexts/JWTContext';
import { useDashboardRoute } from './useDashboardRoute';

export const useNavbarAuth = () => {
  const { user, isAuthenticated, logout, isLoading, isLoggingOut } = useJWT();
  const { getDashboardRoute } = useDashboardRoute();

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";

  const handleLogout = async () => {
    await logout();
  };

  return {
    user,
    isAuthenticated,
    logout: handleLogout,
    isLoading,
    isLoggingOut,
    fullName,
    getDashboardRoute
  };
};
