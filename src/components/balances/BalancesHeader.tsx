
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BalancesHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export const BalancesHeader = ({ refreshing, onRefresh }: BalancesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <Link to="/">
          <Button variant="ghost" size="sm" className="pl-0 mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Balances</h1>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh} 
        disabled={refreshing}
        className="flex items-center gap-2"
      >
        {refreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Refresh
      </Button>
    </div>
  );
};
