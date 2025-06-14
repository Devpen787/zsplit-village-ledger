export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      expense_members: {
        Row: {
          created_at: string | null
          expense_id: string | null
          id: string
          paid_status: boolean | null
          share: number
          share_type: string | null
          share_value: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expense_id?: string | null
          id?: string
          paid_status?: boolean | null
          share?: number
          share_type?: string | null
          share_value?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expense_id?: string | null
          id?: string
          paid_status?: boolean | null
          share?: number
          share_type?: string | null
          share_value?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_members_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number | null
          contribution_tags: string[] | null
          created_at: string | null
          currency: string | null
          date: string | null
          group_id: string | null
          id: string
          leftover_notes: string | null
          leftover_photo: string | null
          paid_by: string | null
          title: string | null
          visibility: string | null
        }
        Insert: {
          amount?: number | null
          contribution_tags?: string[] | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          group_id?: string | null
          id?: string
          leftover_notes?: string | null
          leftover_photo?: string | null
          paid_by?: string | null
          title?: string | null
          visibility?: string | null
        }
        Update: {
          amount?: number | null
          contribution_tags?: string[] | null
          created_at?: string | null
          currency?: string | null
          date?: string | null
          group_id?: string | null
          id?: string
          leftover_notes?: string | null
          leftover_photo?: string | null
          paid_by?: string | null
          title?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_overview: {
        Row: {
          connected_wallets: string | null
          created_at: string | null
          group_name: string
          id: string
          organizers: number | null
          participants: number | null
          pending_payouts: number | null
          pot_balance: number | null
          total_expenses: number | null
        }
        Insert: {
          connected_wallets?: string | null
          created_at?: string | null
          group_name: string
          id?: string
          organizers?: number | null
          participants?: number | null
          pending_payouts?: number | null
          pot_balance?: number | null
          total_expenses?: number | null
        }
        Update: {
          connected_wallets?: string | null
          created_at?: string | null
          group_name?: string
          id?: string
          organizers?: number | null
          participants?: number | null
          pending_payouts?: number | null
          pot_balance?: number | null
          total_expenses?: number | null
        }
        Relationships: []
      }
      group_pot_activity: {
        Row: {
          amount: number | null
          created_at: string | null
          group_id: string | null
          id: string
          note: string | null
          status: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          note?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          note?: string | null
          status?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_pot_activity_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_pot_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          emoji: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          icon?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          emoji?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string | null
          email: string
          group_id: string | null
          id: string
          invited_by: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          group_id?: string | null
          id?: string
          invited_by: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          group_id?: string | null
          id?: string
          invited_by?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          amount: number
          created_at: string | null
          from_user_id: string
          id: string
          settled: boolean | null
          to_user_id: string
          tx_chain: string | null
          tx_hash: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_user_id: string
          id?: string
          settled?: boolean | null
          to_user_id: string
          tx_chain?: string | null
          tx_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_user_id?: string
          id?: string
          settled?: boolean | null
          to_user_id?: string
          tx_chain?: string | null
          tx_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_emoji: string | null
          created_at: string
          display_name: string | null
          email: string
          group_name: string | null
          id: string
          name: string | null
          role: string | null
          wallet_address: string | null
          wallet_visibility: string | null
        }
        Insert: {
          avatar_emoji?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          group_name?: string | null
          id: string
          name?: string | null
          role?: string | null
          wallet_address?: string | null
          wallet_visibility?: string | null
        }
        Update: {
          avatar_emoji?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          group_name?: string | null
          id?: string
          name?: string | null
          role?: string | null
          wallet_address?: string | null
          wallet_visibility?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_balances: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_name: string
          user_email: string
          amount: number
        }[]
      }
      is_group_admin: {
        Args: { group_id_param: string; user_id_param?: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { group_id_param: string; user_id_param?: string }
        Returns: boolean
      }
      user_expenses: {
        Args: { user_id_param?: string }
        Returns: string[]
      }
      user_groups: {
        Args: { user_id_param?: string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
