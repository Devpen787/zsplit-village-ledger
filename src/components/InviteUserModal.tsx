
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { isValidRole } from "@/contexts/AuthContext"

export function InviteUserModal({ onUserAdded }: { onUserAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [group, setGroup] = useState("")
  const [wallet, setWallet] = useState("")
  const [role, setRole] = useState("participant")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInvite = async () => {
    setLoading(true)
    setError(null)

    // Basic validation
    if (!name) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!email || !validateEmail(email)) {
      setError("Valid email is required");
      setLoading(false);
      return;
    }

    // Validate role
    if (!isValidRole(role)) {
      setError("Invalid role");
      setLoading(false);
      return;
    }

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        setError("A user with this email already exists");
        setLoading(false);
        return;
      }

      // Generate a unique ID for the user
      const uniqueId = crypto.randomUUID();

      // Insert the user directly
      const { error } = await supabase.from("users").insert({
        id: uniqueId, // Using a string ID now
        name,
        email,
        group_name: group || null,
        wallet_address: wallet || null,
        role
      });

      if (error) {
        setError(error.message);
      } else {
        setName("");
        setEmail("");
        setGroup("");
        setWallet("");
        setRole("participant");
        setOpen(false);
        onUserAdded();
        toast.success(`User ${name} has been invited successfully`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Don't render the component if user is not an admin
  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">Invite User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="group">Group (optional)</Label>
            <Input id="group" value={group} onChange={(e) => setGroup(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="wallet">Wallet Address (optional)</Label>
            <Input id="wallet" value={wallet} onChange={(e) => setWallet(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? "Inviting..." : "Add User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
