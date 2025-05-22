
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Wallet, ExternalLink, LogOut } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from '@/components/ui/sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const WalletButton = () => {
  const { address, isConnected, isConnecting, connect, disconnect, shortenAddress } = useWallet();
  const [copied, setCopied] = useState(false);
  
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="border-primary/20 bg-primary/5">
            <Wallet className="mr-2 h-4 w-4 text-primary" />
            {shortenAddress(address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Etherscan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  return (
    <Button
      variant="outline"
      onClick={connect}
      disabled={isConnecting}
      className="border-primary/20 hover:bg-primary/5"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
};

export default WalletButton;
