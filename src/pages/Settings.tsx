
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/contexts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from '@/layouts/AppLayout';

const Settings = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('CHF');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSavingPreferences(true);
    try {
      // In a real app, you'd save these preferences to the user record
      // For now we'll just simulate success
      setTimeout(() => {
        toast.success('Preferences saved successfully');
        setSavingPreferences(false);
      }, 500);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
      setSavingPreferences(false);
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Account Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {user && (
                <div className="space-y-1 rounded-md border p-4 bg-muted/20">
                  <h3 className="text-sm font-medium text-muted-foreground">Account Information</h3>
                  <div className="grid gap-1 text-sm">
                    <div className="flex justify-between">
                      <span>Email:</span> 
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Name:</span> 
                      <span className="font-medium">{user.name || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Role:</span> 
                      <span className="font-medium">{user.role || 'User'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account created:</span> 
                      <span className="font-medium">{formatDate(user.created_at || '')}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHF">Swiss Franc (CHF)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive notifications for expense updates</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
              <Button onClick={savePreferences} disabled={savingPreferences}>
                {savingPreferences ? "Saving..." : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleSignOut} disabled={loading} className="w-full" variant="destructive">
                {loading ? "Signing out..." : "Sign Out"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
