
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from 'lucide-react';

interface PayoutRequestsCardProps {
  pendingPayoutsCount: number;
  averageApprovalTime: string;
}

export const PayoutRequestsCard = ({ 
  pendingPayoutsCount, 
  averageApprovalTime 
}: PayoutRequestsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Payout Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">{pendingPayoutsCount} pending requests</p>
              <p className="text-sm text-muted-foreground">awaiting approval</p>
            </div>
            <div>
              <p className="text-lg font-medium text-right">{averageApprovalTime}</p>
              <p className="text-sm text-muted-foreground">average approval time</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
