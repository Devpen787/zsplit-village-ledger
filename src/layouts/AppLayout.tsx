
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home, Plus, User } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around p-3 md:hidden">
        <Link to="/" className="flex flex-col items-center text-muted-foreground hover:text-foreground">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/expenses/new" className="flex flex-col items-center text-muted-foreground hover:text-foreground">
          <Plus className="h-5 w-5" />
          <span className="text-xs mt-1">Add</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-muted-foreground hover:text-foreground">
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};
