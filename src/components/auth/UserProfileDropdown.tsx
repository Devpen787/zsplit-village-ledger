
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, CreditCard, UserCircle, Wallet } from 'lucide-react';

export default function UserProfileDropdown() {
  const { user, signOut } = useAuth();
  const { ready, authenticated, user: privyUser } = usePrivy();
  const navigate = useNavigate();
  const [initials, setInitials] = useState('');

  useEffect(() => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      const initials = nameParts
        .map(part => part.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
      setInitials(initials || 'U');
    } else {
      setInitials('U');
    }
  }, [user]);

  // If not authenticated or not ready, return null
  if (!ready || !authenticated || !user) {
    return null;
  }

  // Get wallet addresses from Privy
  const linkedAccounts = privyUser?.linkedAccounts || [];
  const wallets = linkedAccounts.filter((account: any) => account.type === 'wallet');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user.wallet_address && (
          <>
            <DropdownMenuItem className="gap-2 text-xs text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="truncate">{user.wallet_address}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <UserCircle className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/balances')}>
          <CreditCard className="mr-2 h-4 w-4" />
          Balances
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={signOut} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
