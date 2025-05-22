import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts'; // Updated import

const Profile = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Name</p>
            <p className="text-muted-foreground">{user.name || 'No name set'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Email</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Role</p>
            <p className="text-muted-foreground">{user.role}</p>
          </div>
          <button onClick={signOut} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700">
            Sign Out
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
