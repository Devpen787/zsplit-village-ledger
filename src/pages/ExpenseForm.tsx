
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// This will be replaced with real data from Supabase once integrated
const mockUsers = [
  { id: "1", name: "Anna" },
  { id: "2", name: "Michael" },
  { id: "3", name: "Sarah" },
  { id: "4", name: "Thomas" },
];

const currencies = ["CHF", "USD", "EUR", "USDC"];
const visibilityOptions = [
  { id: "private", label: "Private (only me)" },
  { id: "group", label: "Group (participants only)" },
  { id: "public", label: "Public (anyone in the village)" },
];
const splitMethods = [
  { id: "equal", label: "Equal split" },
  { id: "percentage", label: "Percentage-based split" },
  { id: "custom", label: "Share-based split (e.g. 2x or 0.5x shares)" },
];

const ExpenseForm = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("CHF");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [visibility, setVisibility] = useState("group");
  const [splitMethod, setSplitMethod] = useState("equal");
  const [notes, setNotes] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This will be replaced with Supabase integration
    console.log({
      title,
      amount: parseFloat(amount),
      currency,
      paidBy,
      date,
      visibility,
      splitMethod,
      notes,
      participants: Object.keys(selectedUsers).filter(id => selectedUsers[id]),
    });

    // Redirect after submission
    // Replace with actual navigation after Supabase integration
    alert("Expense added successfully!");
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add Expense</h1>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What was this expense for?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Split with</Label>
            <Card>
              <CardContent className="p-4 space-y-2">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers[user.id] || false}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <Label htmlFor={`user-${user.id}`} className="cursor-pointer">
                      {user.name}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <RadioGroup value={visibility} onValueChange={setVisibility}>
              {visibilityOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`visibility-${option.id}`} />
                  <Label htmlFor={`visibility-${option.id}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Split Method</Label>
            <RadioGroup value={splitMethod} onValueChange={setSplitMethod}>
              {splitMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={`method-${method.id}`} />
                  <Label htmlFor={`method-${method.id}`}>{method.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">Add Expense</Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
