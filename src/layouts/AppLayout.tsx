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
  SidebarProvider
} from "@/components/ui/sidebar";
import { useAuth } from '@/contexts';
import SignInButton from "@/components/auth/SignInButton";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import WalletButton from "@/components/wallet/WalletButton";
import { usePrivy } from '@privy-io/react-auth';
import { 
  Home, 
  Receipt, 
  Wallet, 
  Users, 
  Settings as SettingsIcon, 
  User,
  ArrowLeft,
  PiggyBank,
  Activity
} from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { ready, authenticated } = usePrivy();

  const handleBack = () => {
    if (window.history.length <= 2) {
      navigate('/'); // If no history or at start, go home
    } else {
      window.history.back();
    }
  };

  // Create a header with the logo on the left and auth actions on the right
  const renderHeader = (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 
          className="text-xl font-bold cursor-pointer" 
          onClick={() => navigate("/")}
        >
          Zsplit
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {ready && authenticated && isAuthenticated && <WalletButton />}
        {ready && authenticated && isAuthenticated ? (
          <UserProfileDropdown />
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );

  // Updated navItems - correcting "My Groups" to go to the group dashboard
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Receipt, label: "Add Expense", path: "/expenses/new" },
    { icon: Wallet, label: "Balances", path: "/balances" },
    { icon: Users, label: "Groups", path: "/group" }, // Updated label for clarity
    { icon: PiggyBank, label: "Group Pot", path: "/group-pot" },
    { icon: Activity, label: "Group Pulse", path: "/group-pulse" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row w-full">
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
          
          {/* Mobile bottom navigation */}
          {isMobile && (
            <nav className="border-t bg-background p-2 sticky bottom-0 z-10">
              <div className="flex justify-around">
                {navItems.slice(0, 6).map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className="flex flex-col items-center py-1 px-3"
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
