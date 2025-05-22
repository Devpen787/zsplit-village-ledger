
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Group } from '@/types/supabase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Users, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type GroupsListProps = {
  groups: Group[];
  loading: boolean;
  error: string | null;
  hasRecursionError: boolean;
  onCreateGroup: () => void;
  onRefresh: () => Promise<void>;
};

export const GroupsList = ({ 
  groups, 
  loading, 
  error, 
  hasRecursionError, 
  onCreateGroup, 
  onRefresh 
}: GroupsListProps) => {
  const navigate = useNavigate();

  // Function to get group stats - moved outside of the render loop
  const GroupStats = ({ groupId }: { groupId: string }) => {
    const { data: stats, isLoading: statsLoading } = useQuery({
      queryKey: ['group-stats', groupId],
      queryFn: async () => {
        // Get total expenses for this group
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('group_id', groupId);
          
        if (expensesError) throw expensesError;
        
        const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        
        // Get member count for this group
        const { count, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId);
          
        if (countError) throw countError;
        
        return { totalAmount, memberCount: count || 0 };
      },
      staleTime: 60000, // 1 minute
    });

    return (
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50 text-sm">
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1 text-muted-foreground" />
          {statsLoading ? (
            <Skeleton className="h-4 w-6" />
          ) : (
            <span>{stats?.memberCount || 0} members</span>
          )}
        </div>
        <div className="font-medium">
          {statsLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            stats && stats.totalAmount > 0 ? (
              <span>{stats.totalAmount.toFixed(0)} CHF</span>
            ) : (
              <span className="text-muted-foreground">No expenses</span>
            )
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse min-w-[260px] md:min-w-0">
            <CardContent className="h-32 p-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (hasRecursionError) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="warning" className="bg-amber-50 dark:bg-amber-900/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600">Database Configuration Issue</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <p className="mb-2">We're experiencing a temporary issue with database policies.</p>
              <div className="flex justify-start mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  className="flex items-center gap-1 bg-amber-100 dark:bg-amber-800/30 border-amber-200"
                >
                  <RefreshCw className="h-3 w-3" /> Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (groups.length > 0) {
    return (
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible">
        {groups.map((group) => (
          <Card 
            key={group.id} 
            className="hover:border-primary/50 transition-all cursor-pointer min-w-[260px] md:min-w-0"
            onClick={() => navigate(`/group/${group.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 mr-3">
                    {group.icon || '🏠'}
                  </div>
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Use the GroupStats component instead of inline hook */}
              <GroupStats groupId={group.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Users className="h-12 w-12 text-muted-foreground opacity-50" />
          <div className="space-y-1">
            <h3 className="font-medium">No groups yet</h3>
            <p className="text-sm text-muted-foreground">
              Create a group to start tracking expenses with friends
            </p>
          </div>
          <Button onClick={onCreateGroup} className="mt-2">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
