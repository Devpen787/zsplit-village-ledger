
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface GroupsListErrorProps {
  error: string;
  hasRecursionError?: boolean;
  onRefresh: () => Promise<void>;
}

export const GroupsListError = ({ error, hasRecursionError = false, onRefresh }: GroupsListErrorProps) => {
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
};
