
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Wallet, Check, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts";
import { Progress } from "@/components/ui/progress";

interface WalletInfoProps {
  showDisconnect?: boolean;
  showCopy?: boolean;
  showLabel?: boolean;
  showMessage?: boolean;
  labelPrefix?: string;
  labelSuffix?: string;
  className?: string;
}

const WalletInfo = ({ 
  showDisconnect = true, 
  showCopy = true,
  showLabel = true,
  showMessage = false,
  labelPrefix = "Connected Wallet: ",
  labelSuffix = "",
  className = ""
}: WalletInfoProps) => {
  const { address, isConnected, isConnecting, connect, disconnect, shortenAddress } = useWallet();
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);
  
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // If wallet is connecting, show loading state
  if (isConnecting) {
    return (
      <div className={`flex flex-col space-y-2 ${className}`}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Connecting wallet...</span>
        </div>
        <Progress value={50} className="h-1" />
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <div className={`flex items-center ${className}`}>
        <Button variant="outline" size="sm" onClick={connect}>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
        {showMessage && (
          <span className="ml-2 text-sm text-muted-foreground">
            Connect a wallet for future reimbursements
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center">
        {showLabel && address && (
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">{labelPrefix}</span>
            <span className="font-medium">{shortenAddress(address)}</span>
            <span className="text-muted-foreground">{labelSuffix}</span>
          </div>
        )}
        
        <div className="flex ml-auto space-x-2">
          {showCopy && address && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleCopyAddress}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
          
          {address && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          
          {showDisconnect && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={disconnect}
              className="text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>
      
      {showMessage && (
        <p className="text-sm text-muted-foreground flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
          Your wallet will be used for future reimbursements and on-chain activity.
        </p>
      )}
    </div>
  );
};

export default WalletInfo;
