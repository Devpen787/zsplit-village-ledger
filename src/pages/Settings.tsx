import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-10 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Settings</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user && (
            <div className="space-y-2">
              <p>Logged in as: {user.email}</p>
              <p>Name: {user.name}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
          <Button onClick={handleSignOut} disabled={loading} className="w-full">
            {loading ? "Signing out..." : "Sign Out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

