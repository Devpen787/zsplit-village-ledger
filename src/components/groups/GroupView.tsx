
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { useGroupDetails } from '@/hooks/useGroupDetails';
import { GroupTabs } from './GroupTabs';
import { motion } from 'framer-motion';

interface GroupViewProps {
  groupId: string;
}

export const GroupView = ({ groupId }: GroupViewProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { group, loading } = useGroupDetails(groupId, user);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Group not found</h3>
          <p className="text-muted-foreground mb-4">
            The group you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/group')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Group Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/group')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{group.icon || '🏠'}</div>
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <p className="text-muted-foreground">
                Created {new Date(group.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Group Tabs */}
      <GroupTabs groupId={groupId} isAdmin={true} />
    </motion.div>
  );
};
