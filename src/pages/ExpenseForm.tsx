
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UnifiedParticipantTable } from '@/components/expenses/UnifiedParticipantTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts';
import { useExpenseUsers } from '@/hooks/useExpenseUsers';
import { useExpenseForm, ExpenseFormValues } from '@/hooks/useExpenseForm';

export const ExpenseForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom' | 'percentage'>('equal');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [paidById, setPaidById] = useState<string>('');
  
  // Get participants from Supabase
  const { users: participants, loading: loadingUsers } = useExpenseUsers();
  const { getDefaultValues, onSubmit, submitLoading, groupName } = useExpenseForm(groupId);
  
  // Initialize form with defaults
  useEffect(() => {
    const defaultValues = getDefaultValues();
    
    setTitle(defaultValues.title || '');
    setAmount(defaultValues.amount ? defaultValues.amount.toString() : '');
    setCurrency(defaultValues.currency || 'USD');
    setDescription(defaultValues.notes || '');
    setDate(defaultValues.date || new Date());
    setPaidById(defaultValues.paidBy || user?.id || '');
    
    // Default to equal split
    setSplitMethod('equal');
    
    // Initialize with all participants selected
    if (participants.length > 0) {
      setSelectedParticipantIds(participants.map(p => p.id));
    }
  }, [getDefaultValues, participants, user]);
  
  // Add payer to selected participants whenever it changes
  useEffect(() => {
    if (paidById && !selectedParticipantIds.includes(paidById)) {
      setSelectedParticipantIds(prev => [...prev, paidById]);
    }
  }, [paidById]);

  // Validation
  const isFormValid = () => {
    return (
      title.trim() !== '' &&
      amount !== '' &&
      parseFloat(amount) > 0 &&
      selectedParticipantIds.length > 0 &&
      paidById !== ''
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Please fill in all required fields and select at least one participant.');
      return;
    }
    
    // Create expense form values
    const formValues: ExpenseFormValues = {
      title,
      amount: parseFloat(amount),
      currency,
      date,
      notes: description,
      paidBy: paidById,
      splitEqually: splitMethod === 'equal',
      splitMethod: splitMethod,
      participants: selectedParticipantIds,
    };
    
    try {
      await onSubmit(formValues);
      toast.success('Expense created successfully!');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense. Please try again.');
    }
  };
  
  const handleCancel = () => {
    navigate(groupId ? `/group/${groupId}` : '/');
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Add New Expense {groupName && `for ${groupName}`}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Team Lunch"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <DatePicker 
                  value={date} 
                  onValueChange={setDate} 
                  defaultValue={new Date()} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By *</Label>
              <Select value={paidById} onValueChange={setPaidById}>
                <SelectTrigger id="paidBy">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map(participant => (
                    <SelectItem key={participant.id} value={participant.id}>
                      {participant.display_name || participant.name || participant.email?.split('@')[0] || participant.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional details..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Split Method Card */}
        <Card>
          <CardHeader>
            <CardTitle>Split Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select 
                value={splitMethod} 
                onValueChange={(value: 'equal' | 'custom' | 'percentage') => setSplitMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Split Equally</SelectItem>
                  <SelectItem value="custom">Custom Amount</SelectItem>
                  <SelectItem value="percentage">By Percentage</SelectItem>
                </SelectContent>
              </Select>
              
              {splitMethod === 'equal' && (
                <p className="text-sm text-gray-600">
                  The total amount will be divided equally among all selected participants.
                </p>
              )}
              
              {splitMethod === 'custom' && (
                <p className="text-sm text-gray-600">
                  Specify custom amounts for each participant. The sum must equal the total amount.
                </p>
              )}
              
              {splitMethod === 'percentage' && (
                <p className="text-sm text-gray-600">
                  Specify what percentage each participant should pay. Percentages must sum to 100%.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants Card with Unified Table */}
        <Card>
          <CardHeader>
            <CardTitle>Select Participants *</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="text-center py-4">Loading participants...</div>
            ) : (
              <UnifiedParticipantTable
                participants={participants}
                selectedParticipantIds={selectedParticipantIds}
                onSelectionChange={setSelectedParticipantIds}
                totalAmount={parseFloat(amount) || 0}
                splitMethod={splitMethod}
                paidById={paidById}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || submitLoading}
          >
            {submitLoading ? 'Creating...' : 'Create Expense'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
