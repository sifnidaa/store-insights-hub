import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoadingAuth, role, logout } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (role && !roles.includes(role)) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4 bg-background">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">صلاحيات غير كافية</h1>
          <p className="text-muted-foreground max-w-sm">
            حسابك الحالي لا يملك الصلاحيات اللازمة للوصول إلى هذه الصفحة (الرتبة: {role}).
          </p>
          <div className="flex gap-4 mt-6">
            <a href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
              العودة للرئيسية
            </a>
            <button 
              onClick={() => logout().then(() => window.location.href = "/login")}
              className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded transition-colors"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

