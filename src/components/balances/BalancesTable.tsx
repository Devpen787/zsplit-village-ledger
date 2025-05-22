
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Balance } from '@/types/supabase';

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
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Current Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="text-right">Total Owed</TableHead>
              <TableHead className="text-right">Net Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.userId}>
                <TableCell className="font-medium">{balance.userName}</TableCell>
                <TableCell className="text-right">{balance.amountPaid.toFixed(2)}</TableCell>
                <TableCell className="text-right">{balance.amountOwed.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={balance.netBalance > 0 ? "success" : balance.netBalance < 0 ? "destructive" : "outline"} className="font-mono">
                    {balance.netBalance.toFixed(2)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
