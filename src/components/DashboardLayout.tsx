import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/contexts/StoreContext";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const DashboardLayout = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) => {
  const { settings } = useStore();
  const { isAuthenticated, role, isLoadingAuth } = useAuth();
  
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-3 sticky top-0 z-30">
            <SidebarTrigger />
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="logo"
                className="w-7 h-7 rounded-md object-contain"
              />
            ) : null}
            <h2 className="text-sm font-medium text-muted-foreground">نظام إدارة المتجر</h2>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
