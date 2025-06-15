
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Users, Receipt, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SimpleGroupManagementPanel } from './SimpleGroupManagementPanel';

interface GroupOverviewProps {
  groupId: string;
  groupName?: string;
  isAdmin?: boolean;
}

export const GroupOverview = ({ groupId, groupName, isAdmin }: GroupOverviewProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF -</div>
            <p className="text-xs text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => navigate(`/expenses/new?groupId=${groupId}`)}
          className="flex items-center gap-2"
        >
          <Receipt className="h-4 w-4" />
          Add Expense
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate(`/group/${groupId}/pot`)}
          className="flex items-center gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Group Pot
        </Button>
        
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={() => navigate(`/group/${groupId}/settings`)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        )}
      </div>

      <Separator />

      {/* Management Panel */}
      {isAdmin && (
        <SimpleGroupManagementPanel groupId={groupId} />
      )}
    </motion.div>
  );
};
