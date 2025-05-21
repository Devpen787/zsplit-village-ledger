
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import SignInButton from "@/components/auth/SignInButton";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { usePrivy } from '@privy-io/react-auth';

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

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar on desktop */}
      {!isMobile && <Sidebar className="hidden md:block" />}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {renderHeader}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
