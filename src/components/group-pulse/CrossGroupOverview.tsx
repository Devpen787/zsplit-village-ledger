
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { AllGroupsStats } from '@/hooks/group-pulse/useCrossGroupStats';
import { useAnimations } from '@/hooks/useAnimations';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface CrossGroupOverviewProps {
  allGroupsStats: AllGroupsStats | null;
}

export const CrossGroupOverview = ({ allGroupsStats }: CrossGroupOverviewProps) => {
  const { itemVariants } = useAnimations();
  const navigate = useNavigate();

  const handleGroupClick = (groupId: string) => {
    navigate(`/group-pulse/${groupId}`);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>All Groups Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Total Groups</p>
              <p className="text-2xl font-bold">{allGroupsStats?.totalGroups || '...'}</p>
            </div>
            
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Combined Pot Balance</p>
              <p className="text-2xl font-bold">CHF {allGroupsStats?.totalPotBalance?.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="border rounded-md p-3 bg-muted/30">
              <p className="text-sm font-medium text-muted-foreground">Total Pending Payouts</p>
              <p className="text-2xl font-bold">{allGroupsStats?.totalPendingPayouts || '0'}</p>
            </div>
          </div>
          
          {!allGroupsStats ? (
            <div className="flex items-center justify-center p-6 mt-6">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-muted-foreground">Loading cross-group statistics...</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      {allGroupsStats?.groupComparisons ? (
        <Card>
          <CardHeader>
            <CardTitle>Group Comparisons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Pot Balance</TableHead>
                  <TableHead>Pending Payouts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGroupsStats.groupComparisons.map((group) => (
                  <TableRow key={group.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.membersCount}</TableCell>
                    <TableCell>CHF {group.potBalance.toFixed(2)}</TableCell>
                    <TableCell>{group.pendingPayouts}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleGroupClick(group.id)}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
