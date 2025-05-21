
import { ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import SignInButton from "@/components/auth/SignInButton";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { usePrivy } from '@privy-io/react-auth';
import { 
  Home, 
  Receipt, 
  Wallet, 
  Users, 
  Settings as SettingsIcon, 
  User
} from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { ready, authenticated } = usePrivy();

  // Create a header with the logo on the left and auth actions on the right
  const renderHeader = (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-2">
        <h1 
          className="text-xl font-bold cursor-pointer" 
          onClick={() => navigate("/")}
        >
          Zsplit
        </h1>
      </div>
      <div>
        {ready && authenticated && isAuthenticated ? (
          <UserProfileDropdown />
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );

  // Sidebar navigation items
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Receipt, label: "Expenses", path: "/expenses/new" },
    { icon: Wallet, label: "Balances", path: "/balances" },
    { icon: Users, label: "Group", path: "/group" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar on desktop */}
      {!isMobile && (
        <Sidebar className="hidden md:block">
          <SidebarHeader>
            <div className="p-2">
              <h2 className="text-xl font-bold">Zsplit</h2>
              <p className="text-sm text-muted-foreground">Split expenses easily</p>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            {authenticated ? (
              <UserProfileDropdown />
            ) : (
              <SignInButton />
            )}
          </SidebarFooter>
        </Sidebar>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {renderHeader}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
