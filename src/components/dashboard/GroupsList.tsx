
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, RefreshCw, UserPlus } from "lucide-react";
import { Group } from '@/types/supabase';
import { Skeleton } from "@/components/ui/skeleton";

export interface GroupsListProps {
  groups: Group[];
  loading: boolean;
  error: string | null;
  hasRecursionError?: boolean;
  onCreateGroup: () => void;
  onRefresh: () => Promise<void>;
  onGroupSelect?: (groupId: string) => void;
}

export const GroupsList = ({ 
  groups, 
  loading, 
  error, 
  hasRecursionError = false, 
  onCreateGroup,
  onRefresh,
  onGroupSelect
}: GroupsListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="cursor-pointer hover:bg-accent/20 transition-colors">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-8 rounded-full mb-4" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (hasRecursionError) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-medium">Database Configuration Issue</h3>
              <p className="text-sm text-muted-foreground">
                There's a recursive policy issue in the database. Please contact support for assistance.
              </p>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-medium">Error Loading Groups</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (groups.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <UserPlus className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No Groups Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first group to start tracking shared expenses
          </p>
          <Button onClick={onCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <Card 
          key={group.id} 
          className="cursor-pointer hover:bg-accent/20 transition-colors"
          onClick={() => onGroupSelect && onGroupSelect(group.id)}
        >
          <CardContent className="p-6">
            <div className="text-3xl mb-4">{group.icon}</div>
            <h3 className="font-medium text-lg mb-1">{group.name}</h3>
            <p className="text-sm text-muted-foreground">
              Created {new Date(group.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
      <Card 
        className="cursor-pointer hover:bg-accent/20 transition-colors border-dashed border-2 border-muted"
        onClick={onCreateGroup}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
          <Plus className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-medium">Create New Group</h3>
        </CardContent>
      </Card>
    </div>
  );
};
