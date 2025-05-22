
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/contexts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/layouts/AppLayout";
import { Loader2 } from "lucide-react";

const emojis = ["😀", "😎", "🐱", "🚀", "🌟", "🍕", "🏄‍♂️", "🎮", "📚", "🎸"];

const Profile = () => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [selectedEmoji, setSelectedEmoji] = useState('😀');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          name: displayName,
          avatar_emoji: selectedEmoji 
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>Manage your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {user.avatar_emoji || displayName?.charAt(0) || '👤'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Avatar Emoji</Label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-10 h-10 flex items-center justify-center text-xl rounded-md hover:bg-accent ${
                        selectedEmoji === emoji ? "bg-primary/20 border-2 border-primary" : "bg-secondary"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="w-full border-t my-4"></div>
            <Button 
              variant="destructive" 
              onClick={signOut} 
              className="w-full"
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
