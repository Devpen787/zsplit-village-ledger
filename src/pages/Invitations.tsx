
import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import { InvitationsPanel } from '@/components/groups/InvitationsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const Invitations = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Group Invitations</h1>
            <p className="text-muted-foreground">Manage your group invitations</p>
          </div>
        </div>
        
        <InvitationsPanel />
      </div>
    </AppLayout>
  );
};

export default Invitations;
