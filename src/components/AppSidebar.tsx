import { LayoutDashboard, ShoppingCart, Package, FileText, Users, LogOut, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "@/contexts/StoreContext";
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
  const { logout, settings, role } = useStore();

  const visibleNavItems = navItems.filter(item => {
    if (role !== "seller") return true;
    return item.url === "/pos" || item.url === "/inventory" || item.url === "/settings";
  });

  return (
    <Sidebar collapsible="icon" side="right" className="border-l-0">
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        <div className="p-4 flex items-center gap-3">
          {settings.logoDataUrl ? (
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
              <img
                src={settings.logoDataUrl}
                alt="logo"
                className="w-5 h-5 rounded-md object-contain"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
          )}
          {!collapsed && <span className="font-bold text-lg">{settings.storeName}</span>}
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
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
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
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => { logout(); navigate("/"); }}
              className="text-sidebar-foreground/70 hover:text-destructive"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>تسجيل الخروج</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
