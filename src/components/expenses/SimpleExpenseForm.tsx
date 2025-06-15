
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimpleExpenseCreation } from '@/hooks/useSimpleExpenseCreation';
import { useSimpleGroupMembers } from '@/hooks/useSimpleGroupMembers';
import { useAuth } from '@/contexts';

interface SimpleExpenseFormProps {
  groupId?: string | null;
}

export const SimpleExpenseForm = ({ groupId }: SimpleExpenseFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createExpense, loading } = useSimpleExpenseCreation();
  const { members } = useSimpleGroupMembers(groupId || undefined);
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: 'CHF',
    date: new Date().toISOString().split('T')[0],
    paid_by: user?.id || '',
    leftover_notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.paid_by) {
      return;
    }

    try {
      await createExpense({
        title: formData.title,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        date: new Date(formData.date).toISOString(),
        paid_by: formData.paid_by,
        group_id: groupId || undefined,
        leftover_notes: formData.leftover_notes || undefined
      });
      
      // Navigate back to the group or expenses page
      if (groupId) {
        navigate(`/group/${groupId}`);
      } else {
        navigate('/expenses');
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleBack = () => {
    if (groupId) {
      navigate(`/group/${groupId}`);
    } else {
      navigate('/expenses');
    }
  };

  // Get available users (either group members or just current user)
  const availableUsers = groupId && members.length > 0 
    ? members.map(member => ({
        id: member.user?.id || '',
        name: member.user?.name || 'Unknown User',
        email: member.user?.email || ''
      }))
    : user ? [{
        id: user.id,
        name: user.name || 'You',
        email: user.email
      }] : [];

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              <CardTitle>
                {groupId ? 'Add Group Expense' : 'Add Personal Expense'}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Expense Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What did you spend on?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_by">Paid By</Label>
              <Select
                value={formData.paid_by}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paid_by: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.leftover_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, leftover_notes: e.target.value }))}
                placeholder="Any additional notes about this expense..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.amount || !formData.paid_by}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Expense'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
