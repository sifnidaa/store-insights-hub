import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/contexts/StoreContext";
import { Navigate } from "react-router-dom";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b bg-card px-4 gap-3 sticky top-0 z-30">
            <SidebarTrigger />
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
