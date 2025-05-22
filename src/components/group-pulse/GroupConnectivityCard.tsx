
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet } from 'lucide-react';

interface GroupConnectivityCardProps {
  connectedWalletsCount: number;
  totalMembersCount: number;
}

export const GroupConnectivityCard = ({ 
  connectedWalletsCount, 
  totalMembersCount 
}: GroupConnectivityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Group Connectivity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">{connectedWalletsCount} of {totalMembersCount} members</p>
              <p className="text-sm text-muted-foreground">have connected wallets</p>
            </div>
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">Zulink</p>
              <p className="text-sm text-muted-foreground">VPN status</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
