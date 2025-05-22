
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/auth";

type UserWelcomeCardProps = {
  user: User;
};

export const UserWelcomeCard = ({ user }: UserWelcomeCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-none">
      <CardContent className="pt-6">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
            <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-medium">
              Welcome, {user.name || user.email?.split('@')[0]}!
            </h2>
            <p className="text-sm text-muted-foreground">
              Track expenses and split bills with your friends
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
