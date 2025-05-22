
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroupPot } from '@/hooks/useGroupPot';
import { PotContributionsCard } from './PotContributionsCard';
import { PotActivityFeed } from './PotActivityFeed';
import { RequestPayoutForm } from './RequestPayoutForm';
import { PendingPayoutRequests } from './PendingPayoutRequests';
import { Loader2 } from 'lucide-react';

interface GroupPotProps {
  groupId: string;
}

export const GroupPot = ({ groupId }: GroupPotProps) => {
  const { 
    activities, 
    totalContributions, 
    contributors, 
    loading, 
    handlePayoutRequest, 
    handleContribute,
    isAdmin,
    handleApproveRequest,
    handleRejectRequest
  } = useGroupPot(groupId);
  
  // Default target amount - could be fetched from group settings in the future
  const targetAmount = 300;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PotContributionsCard 
        totalContributions={totalContributions} 
        targetAmount={targetAmount} 
        contributors={contributors}
        onContribute={handleContribute}
      />
      
      {/* Admin Panel - Only visible to admins */}
      {isAdmin && (
        <PendingPayoutRequests 
          activities={activities}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
        />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <RequestPayoutForm onSubmit={handlePayoutRequest} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Group Pot Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <PotActivityFeed activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
};
