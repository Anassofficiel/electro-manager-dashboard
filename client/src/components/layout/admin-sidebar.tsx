import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-local-data";

const menuItems = [
  { title: "Overview", icon: LayoutDashboard, path: "/admin" },
  { title: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { title: "Customers", icon: Users, path: "/admin/customers" },
  { title: "Analytics", icon: BarChart3, path: "/admin/analytics" },
];

const bottomItems = [
  { title: "Settings", icon: Settings, path: "/admin/settings" },
  { title: "Profile", icon: UserCircle, path: "/admin/profile" },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { state } = useSidebar();

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <SidebarContent>
        <div className="flex items-center h-16 px-4 mb-4 border-b border-border/50">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary/70 text-white font-bold shadow-md shadow-primary/20 mr-3 shrink-0">
            EM
          </div>

          {!isCollapsed && (
            <span className="font-display font-bold text-lg tracking-tight truncate text-foreground">
              ELECTRO MANAGER
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            Main Menu
          </SidebarGroupLabel>

          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive =
                location === item.path ||
                (item.path !== "/admin" && location.startsWith(item.path));

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className="mb-1 rounded-xl transition-all duration-200"
                  >
                    <Link href={item.path} className="flex items-center gap-3">
                      <item.icon
                        className={`w-5 h-5 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2">
            Preferences
          </SidebarGroupLabel>

          <SidebarMenu>
            {bottomItems.map((item) => {
              const isActive = location === item.path;

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className="mb-1 rounded-xl transition-all duration-200"
                  >
                    <Link href={item.path} className="flex items-center gap-3">
                      <item.icon
                        className={`w-5 h-5 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <SidebarMenuButton
          onClick={() => logout()}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-200"
          tooltip="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}