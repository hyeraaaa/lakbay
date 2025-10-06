// Main HOC
export { default as withAuth } from './withAuth';

// Route Components
export { default as ProtectedRoute } from './ProtectedRoute';
export { default as AdminRoute } from './AdminRoute';
export { default as OwnerRoute } from './OwnerRoute';
export { default as UserRoute } from './UserRoute';
export { default as AuthRoute } from './AuthRoute';

// Re-export types for convenience
export type { WithAuthOptions, WithAuthProps } from './withAuth';
