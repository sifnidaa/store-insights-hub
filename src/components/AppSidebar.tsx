import { LayoutDashboard, ShoppingCart, Package, FileText, Users, LogOut, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Smartphone } from "lucide-react";

const navItems = [
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard },
  { title: "نقطة البيع", url: "/pos", icon: ShoppingCart },
  { title: "المخزون", url: "/inventory", icon: Package },
  { title: "الفواتير", url: "/invoices", icon: FileText },
  { title: "الموردين", url: "/suppliers", icon: Users },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useStore();
  const { logout, role, currentUser } = useAuth();

  const visibleNavItems = navItems.filter(item => {
    if (role !== "seller") return true;
    return item.url === "/pos" || item.url === "/inventory" || item.url === "/settings";
  });

  return (
    <Sidebar collapsible="icon" side="right" className="border-l-0">
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        <div className="p-6 flex items-center gap-4 border-b border-sidebar-border/50 mb-2">
          {settings.logoUrl ? (
            <div className={`rounded-xl bg-sidebar-primary/10 p-1 flex items-center justify-center shrink-0 transition-all ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
              <img
                src={settings.logoUrl}
                alt="logo"
                className="w-full h-full rounded-lg object-contain"
              />
            </div>
          ) : (
            <div className={`rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0 transition-all ${collapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
              <Smartphone className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xl truncate leading-tight">{settings.storeName}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">نظام الإدارة</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-primary">
                      <item.icon className="w-6 h-6 shrink-0" />
                      {!collapsed && <span className="text-base font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem className="mb-2">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/30 mx-2 transition-all ${collapsed ? 'justify-center p-1' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                {currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{currentUser?.fullName || "مستخدم"}</span>
                  <span className="text-[10px] text-muted-foreground truncate uppercase">{role === "admin" ? "مدير النظام" : "بائع"}</span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async () => { await logout(); navigate("/"); }}
              className="text-sidebar-foreground/70 hover:text-destructive h-12"
            >
              <LogOut className="w-6 h-6 shrink-0" />
              {!collapsed && <span className="text-base font-medium">تسجيل الخروج</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
