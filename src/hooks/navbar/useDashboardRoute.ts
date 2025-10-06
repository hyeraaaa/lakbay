export const useDashboardRoute = () => {
  const getDashboardRoute = (userType: string): string => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'owner':
        return '/owner';
      case 'customer':
      default:
        return '/user';
    }
  };

  return {
    getDashboardRoute
  };
};
