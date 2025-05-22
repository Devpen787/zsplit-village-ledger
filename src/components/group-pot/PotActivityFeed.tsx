
import React from 'react';
import { PotActivity } from '@/types/group-pot';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface PotActivityFeedProps {
  activities: PotActivity[];
}

export const PotActivityFeed = ({ activities }: PotActivityFeedProps) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No activity yet. Be the first to contribute to the group pot!
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className="flex items-start p-4 rounded-lg border border-border bg-card"
        >
          <div className="flex-shrink-0 mr-4">
            <div className={`p-2 rounded-full ${
              activity.type === 'contribution' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {activity.type === 'contribution' 
                ? <ArrowUp className="h-5 w-5" /> 
                : <ArrowDown className="h-5 w-5" />}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {activity.users?.name || activity.users?.email || 'Unknown user'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  activity.type === 'contribution' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {activity.type === 'contribution' ? '+' : '-'} {activity.amount.toFixed(2)} CHF
                </p>
                <Badge variant={getStatusVariant(activity.status)} className="mt-1">
                  {formatStatus(activity.status)}
                </Badge>
              </div>
            </div>
            
            {activity.note && (
              <p className="mt-2 text-sm">{activity.note}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

function formatStatus(status: string | null): string {
  if (!status) return 'Unknown';
  
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'complete':
      return 'Complete';
    case 'rejected':
      return 'Rejected';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function getStatusVariant(status: string | null): 
  "default" | "secondary" | "destructive" | "outline" {
  if (!status) return 'outline';
  
  switch (status.toLowerCase()) {
    case 'pending':
      return 'outline';
    case 'approved':
      return 'secondary';
    case 'complete':
      return 'default';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}
