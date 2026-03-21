/**
 * Protected Route Component
 * 
 * This component acts as a gatekeeper for routes that require authentication.
 * It checks if the user is logged in and whether they have the required role.
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoadingAuth, role } = useAuth();
  const location = useLocation();

  // Step 1: Show a loading spinner while the initial session is being verified
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Step 2: If the user is NOT authenticated, redirect to the login page
  if (!isAuthenticated) {
    // We save the current location in the navigation state so we can redirect back
    // after a successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Step 3: If a specific role is required, verify the user's role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (role && !roles.includes(role)) {
      // Step 4: If the user doesn't have the required role, 
      // redirect them to their default landing page based on their role.
      console.warn(`Access denied: User role "${role}" is not one of [${roles.join(", ")}]`);
      return <Navigate to={role === "seller" ? "/pos" : "/dashboard"} replace />;
    }
  }

  // Step 5: If all checks pass, render the protected children component
  return <>{children}</>;
};

export default ProtectedRoute;

