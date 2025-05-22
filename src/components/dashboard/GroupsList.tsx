
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Group } from '@/types/supabase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Users, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";

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

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card 
            key={group.id} 
            className="hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => navigate(`/group/${group.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 mr-3">
                    {group.icon || '🏠'}
                  </div>
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
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
