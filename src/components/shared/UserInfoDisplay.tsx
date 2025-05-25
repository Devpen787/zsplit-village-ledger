
import React from 'react';
import { Wallet } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatUserWithWallet } from '@/utils/userDisplayUtils';

interface UserInfoDisplayProps {
  user: {
    name?: string | null;
    email?: string | null;
    wallet_address?: string | null;
  };
  showWalletDetails?: boolean;
  className?: string;
}

export const UserInfoDisplay = ({ 
  user, 
  showWalletDetails = true,
  className = '' 
}: UserInfoDisplayProps) => {
  const { displayName, wallet } = formatUserWithWallet(user);
  
  return (
    <div className={className}>
      <div className="font-medium">{displayName}</div>
      {showWalletDetails && (
        <>
          {wallet.hasWallet ? (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Wallet className="h-3 w-3 mr-1" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-default">
                    <span>Wallet: {wallet.shortAddress}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Request will be reimbursed to this wallet</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">No wallet connected</div>
          )}
        </>
      )}
    </div>
  );
};
