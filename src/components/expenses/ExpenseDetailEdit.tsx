
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bitcoin, DollarSign, Euro, PoundSterling, SwissFranc } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

interface ExpenseDetailEditProps {
  editedTitle: string;
  editedAmount: string;
  editedCurrency: string;
  editedDate: Date | null;
  editedPaidBy: string;
  expenseUsers: any[];
  onTitleChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onDateChange: (value: Date | null) => void;
  onPaidByChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  loading: boolean;
}

export const ExpenseDetailEdit = ({
  editedTitle,
  editedAmount,
  editedCurrency,
  editedDate,
  editedPaidBy,
  expenseUsers,
  onTitleChange,
  onAmountChange,
  onCurrencyChange,
  onDateChange,
  onPaidByChange,
  onCancel,
  onSave,
  loading
}: ExpenseDetailEditProps) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          value={editedTitle}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          type="number"
          id="amount"
          value={editedAmount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Select value={editedCurrency} onValueChange={onCurrencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>USD</span>
              </div>
            </SelectItem>
            <SelectItem value="EUR">
              <div className="flex items-center">
                <Euro className="mr-2 h-4 w-4" />
                <span>EUR</span>
              </div>
            </SelectItem>
            <SelectItem value="GBP">
              <div className="flex items-center">
                <PoundSterling className="mr-2 h-4 w-4" />
                <span>GBP</span>
              </div>
            </SelectItem>
            <SelectItem value="CHF">
              <div className="flex items-center">
                <SwissFranc className="mr-2 h-4 w-4" />
                <span>CHF</span>
              </div>
            </SelectItem>
            <SelectItem value="BTC">
              <div className="flex items-center">
                <Bitcoin className="mr-2 h-4 w-4" />
                <span>BTC</span>
              </div>
            </SelectItem>
            <SelectItem value="ETH">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-mono">Ξ</span>
                <span>ETH</span>
              </div>
            </SelectItem>
            <SelectItem value="USDC">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-mono">$</span>
                <span>USDC</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Date</Label>
        <DatePicker
          value={editedDate}
          onValueChange={onDateChange}
        />
      </div>
      <div>
        <Label htmlFor="paidBy">Paid By</Label>
        <Select value={editedPaidBy} onValueChange={onPaidByChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {expenseUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </>
  );
};
