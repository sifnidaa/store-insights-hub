import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/contexts/StoreContext";
import { Navigate } from "react-router-dom";

type UserRole = "admin" | "seller";

const DashboardLayout = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) => {
  const { isAuthenticated, role, settings } = useStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Sellers should land on a page they can use; admins go to dashboard.
    return <Navigate to={role === "seller" ? "/pos" : "/dashboard"} replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-3 sticky top-0 z-30">
            <SidebarTrigger />
            {settings.logoDataUrl ? (
              <img
                src={settings.logoDataUrl}
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
