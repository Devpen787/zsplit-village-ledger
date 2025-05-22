
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts';

export interface BalanceData {
  userId: string;
  userName: string | null;
  amountPaid: number;
  amountOwed: number;
  netBalance: number;
}

interface BalancesTableProps {
  balances: BalanceData[];
}

export const BalancesTable = ({ balances }: BalancesTableProps) => {
  const { user } = useAuth();
  
  // Check if all balances are settled
  const allSettled = balances.every(balance => Math.abs(balance.netBalance) < 0.01);
  
  // Get debt relationships
  const getDebtRelationship = (balance: BalanceData) => {
    if (Math.abs(balance.netBalance) < 0.01) return "Settled";
    
    if (balance.netBalance > 0) {
      // This user is owed money
      const debtors = balances.filter(b => b.netBalance < 0);
      if (debtors.length === 0) return "";
      
      if (debtors.length === 1) {
        return `Is owed by ${debtors[0].userName}`;
      } else {
        return `Is owed by ${debtors.length} people`;
      }
    } else {
      // This user owes money
      const creditors = balances.filter(b => b.netBalance > 0);
      if (creditors.length === 0) return "";
      
      if (creditors.length === 1) {
        return `Owes ${creditors[0].userName}`;
      } else {
        return `Owes ${creditors.length} people`;
      }
    }
  };
  
  return (
    <Card className={`mb-6 ${allSettled ? 'opacity-90' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Current Balances</CardTitle>
        {allSettled && (
          <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-200">
            All settled up!
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Total Owed</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end">
                    Net Balance
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">Net Balance = Total Paid - Total Owed</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
                <TableHead>Owes / Is Owed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.map((balance) => {
                const isCurrentUser = balance.userId === user?.id;
                return (
                  <TableRow key={balance.userId} className={isCurrentUser ? 'bg-primary/5' : ''}>
                    <TableCell className="font-medium">
                      {isCurrentUser ? `${balance.userName} (You)` : balance.userName}
                    </TableCell>
                    <TableCell className="text-right">{balance.amountPaid.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{balance.amountOwed.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={balance.netBalance > 0 ? "success" : balance.netBalance < 0 ? "destructive" : "outline"} className="font-mono">
                        {balance.netBalance.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {Math.abs(balance.netBalance) > 0.01 && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {getDebtRelationship(balance)}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
