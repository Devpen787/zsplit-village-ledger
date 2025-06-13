
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Clock, UserCheck, Copy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { MockSyncEngine } from '@/adapters/sync/MockSyncEngine';
import { GuestUser } from '@/adapters/sync/types';

const GuestUserManager: React.FC = () => {
  const [guestName, setGuestName] = useState('');
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const syncEngine = new MockSyncEngine();

  const createGuestUser = async () => {
    if (!guestName.trim()) {
      toast.error('Please enter a name for the guest user');
      return;
    }

    setLoading(true);
    try {
      const guestUser = await syncEngine.createGuestUser(guestName);
      setGuestUsers(prev => [...prev, guestUser]);
      setGuestName('');
      toast.success(`Guest user "${guestUser.name}" created successfully`);
    } catch (error) {
      console.error('Failed to create guest user:', error);
      toast.error('Failed to create guest user');
    } finally {
      setLoading(false);
    }
  };

  const upgradeGuestUser = async () => {
    if (!selectedGuest || !upgradeEmail.trim()) {
      toast.error('Please select a guest user and enter an email');
      return;
    }

    setLoading(true);
    try {
      const newUserId = `user-${Date.now()}`;
      const success = await syncEngine.upgradeGuestUser(selectedGuest, newUserId, upgradeEmail);
      
      if (success) {
        setGuestUsers(prev => prev.filter(guest => guest.temp_id !== selectedGuest));
        setSelectedGuest('');
        setUpgradeEmail('');
        toast.success('Guest user upgraded to full user successfully');
      } else {
        toast.error('Failed to upgrade guest user');
      }
    } catch (error) {
      console.error('Failed to upgrade guest user:', error);
      toast.error('Failed to upgrade guest user');
    } finally {
      setLoading(false);
    }
  };

  const copyGuestId = (tempId: string) => {
    navigator.clipboard.writeText(tempId);
    toast.success('Guest ID copied to clipboard');
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const remaining = expires - now;
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="space-y-6">
      {/* Create Guest User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Guest User
          </CardTitle>
          <CardDescription>
            Create temporary users that can participate without full registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-name">Guest Name</Label>
            <Input
              id="guest-name"
              placeholder="Enter guest user name..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createGuestUser()}
            />
          </div>
          <Button 
            onClick={createGuestUser}
            disabled={loading || !guestName.trim()}
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Guest User
          </Button>
        </CardContent>
      </Card>

      {/* Active Guest Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Guest Users
          </CardTitle>
          <CardDescription>
            Manage temporary guest users and their access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guestUsers.length > 0 ? (
            <div className="space-y-3">
              {guestUsers.map((guest) => (
                <div key={guest.temp_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{guest.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Guest
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTimeRemaining(guest.expires_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-gray-100 px-1 rounded">
                        {guest.temp_id.substring(0, 20)}...
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyGuestId(guest.temp_id)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedGuest(guest.temp_id)}
                  >
                    Upgrade
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No active guest users
            </p>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Guest User */}
      {selectedGuest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Upgrade Guest User
            </CardTitle>
            <CardDescription>
              Convert guest user to full registered user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upgrade-email">Email Address</Label>
              <Input
                id="upgrade-email"
                type="email"
                placeholder="Enter email for the new user..."
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={upgradeGuestUser}
                disabled={loading || !upgradeEmail.trim()}
                className="flex-1"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Upgrade User
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedGuest('');
                  setUpgradeEmail('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuestUserManager;
