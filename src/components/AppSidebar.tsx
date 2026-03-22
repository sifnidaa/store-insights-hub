import { LayoutDashboard, ShoppingCart, Package, FileText, Users, LogOut, Settings, Receipt } from "lucide-react";
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
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager"] },
  { title: "نقطة البيع", url: "/pos", icon: ShoppingCart, roles: ["admin", "seller"] },
  { title: "سجل المعاملات", url: "/transactions", icon: Receipt, roles: ["admin", "seller"] },
  { title: "المخزون", url: "/inventory", icon: Package, roles: ["admin", "seller"] },
  { title: "الفواتير", url: "/invoices", icon: FileText, roles: ["admin", "manager"] },
  { title: "الموردين", url: "/suppliers", icon: Users, roles: ["admin", "manager"] },
  { title: "الإعدادات", url: "/settings", icon: Settings, roles: ["admin"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useStore();
  const { logout, role, currentUser } = useAuth();

  const visibleNavItems = navItems.filter(item => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  return (
    <Sidebar collapsible="icon" side="right" className="border-l border-sidebar-border">
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        {/* Store branding */}
        <div className={`flex items-center gap-3 border-b border-sidebar-border ${collapsed ? 'p-3 justify-center' : 'px-5 py-4'}`}>
          {settings.logoUrl ? (
            <div className={`rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center shrink-0 ${collapsed ? 'w-9 h-9' : 'w-10 h-10'}`}>
              <img src={settings.logoUrl} alt="logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className={`rounded-xl bg-primary flex items-center justify-center shrink-0 ${collapsed ? 'w-9 h-9' : 'w-10 h-10'}`}>
              <Smartphone className={`text-primary-foreground ${collapsed ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base truncate leading-tight text-sidebar-foreground">{settings.storeName}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">نظام الإدارة</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs px-5">القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2">
              {visibleNavItems.map(item => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="h-10 rounded-lg"
                  >
                    <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold">
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <SidebarMenu className="px-2">
          <SidebarMenuItem className="mb-1">
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 ${collapsed ? 'justify-center px-1' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                {currentUser?.fullName?.charAt(0) || currentUser?.email?.charAt(0)?.toUpperCase() || "؟"}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{currentUser?.fullName || "مستخدم"}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{role === "admin" ? "مدير النظام" : "بائع"}</span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await logout();
                } catch(error) {
                  console.error(error);
                } finally {
                  navigate("/");
                }
              }}
              className="text-muted-foreground hover:text-destructive h-10 rounded-lg"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">تسجيل الخروج</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
