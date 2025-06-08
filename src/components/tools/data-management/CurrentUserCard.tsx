
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthUser } from '@/adapters/types';

interface CurrentUserCardProps {
  user: AuthUser;
}

const CurrentUserCard = ({ user }: CurrentUserCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Name:</strong> {user.name || 'Not set'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentUserCard;
