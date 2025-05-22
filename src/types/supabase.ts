
// Custom types for Supabase tables not yet reflected in the generated types
export interface Group {
  id: string;
  name: string;
  icon: string;
  created_at: string;
  created_by: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  created_at: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface Balance {
  user_id: string;
  user_name: string | null;
  user_email: string;
  amount: number;
}
