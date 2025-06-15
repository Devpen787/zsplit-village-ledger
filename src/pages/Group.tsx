
import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGroupsList } from "@/hooks/useGroupsList";
import { motion } from "framer-motion";

const Group = () => {
  const navigate = useNavigate();
  const { groups, loading } = useGroupsList();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div 
        className="container mx-auto py-6 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Groups</h1>
              <p className="text-muted-foreground">Manage your expense groups</p>
            </div>
          </div>
          <Button onClick={() => navigate('/group/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{group.icon || '🏠'}</div>
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/group/${group.id}`)}
                  >
                    View Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first group to start tracking shared expenses
              </p>
              <Button onClick={() => navigate('/group/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AppLayout>
  );
};

export default Group;
