export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
          visibility: Database["public"]["Enums"]["category_visibility"] | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["category_visibility"] | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["category_visibility"] | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          carrier_code: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          payment_method: string | null
          payment_status: string | null
          pickup_type: string | null
          scheduled_time: string | null
          ship_to_address: Json | null
          shipped_at: string | null
          shipstation_order_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tax: number
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
          wholesale_account_id: string | null
        }
        Insert: {
          carrier_code?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          payment_method?: string | null
          payment_status?: string | null
          pickup_type?: string | null
          scheduled_time?: string | null
          ship_to_address?: Json | null
          shipped_at?: string | null
          shipstation_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          wholesale_account_id?: string | null
        }
        Update: {
          carrier_code?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          payment_method?: string | null
          payment_status?: string | null
          pickup_type?: string | null
          scheduled_time?: string | null
          ship_to_address?: Json | null
          shipped_at?: string | null
          shipstation_order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          wholesale_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_wholesale_account_id_fkey"
            columns: ["wholesale_account_id"]
            isOneToOne: false
            referencedRelation: "wholesale_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          dietary_tags: string[] | null
          featured: boolean | null
          id: string
          images: string[] | null
          inventory_available: boolean | null
          name: string
          options: Json | null
          retail_price: number
          slug: string
          sort_order: number | null
          updated_at: string | null
          wholesale_minimum: number | null
          wholesale_price: number | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          inventory_available?: boolean | null
          name: string
          options?: Json | null
          retail_price?: number
          slug: string
          sort_order?: number | null
          updated_at?: string | null
          wholesale_minimum?: number | null
          wholesale_price?: number | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          inventory_available?: boolean | null
          name?: string
          options?: Json | null
          retail_price?: number
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
          wholesale_minimum?: number | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_analytics: {
        Row: {
          by_carrier: Json | null
          by_city: Json | null
          by_state: Json | null
          created_at: string | null
          id: string
          late_count: number | null
          on_time_count: number | null
          period_end: string
          period_start: string
          total_cost: number | null
          total_shipments: number | null
        }
        Insert: {
          by_carrier?: Json | null
          by_city?: Json | null
          by_state?: Json | null
          created_at?: string | null
          id?: string
          late_count?: number | null
          on_time_count?: number | null
          period_end: string
          period_start: string
          total_cost?: number | null
          total_shipments?: number | null
        }
        Update: {
          by_carrier?: Json | null
          by_city?: Json | null
          by_state?: Json | null
          created_at?: string | null
          id?: string
          late_count?: number | null
          on_time_count?: number | null
          period_end?: string
          period_start?: string
          total_cost?: number | null
          total_shipments?: number | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_accounts: {
        Row: {
          address: string | null
          business_name: string
          contact_name: string
          created_at: string | null
          email: string
          id: string
          notes: string | null
          phone: string | null
          shipping_address: Json | null
          status: Database["public"]["Enums"]["wholesale_account_status"] | null
          tier: Database["public"]["Enums"]["wholesale_tier"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          contact_name: string
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: Json | null
          status?:
            | Database["public"]["Enums"]["wholesale_account_status"]
            | null
          tier?: Database["public"]["Enums"]["wholesale_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          phone?: string | null
          shipping_address?: Json | null
          status?:
            | Database["public"]["Enums"]["wholesale_account_status"]
            | null
          tier?: Database["public"]["Enums"]["wholesale_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "wholesale_customer"
      category_visibility: "retail" | "wholesale" | "both"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "completed"
        | "cancelled"
      order_type: "retail" | "wholesale"
      wholesale_account_status: "pending" | "approved" | "rejected"
      wholesale_tier: "standard" | "premium" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "wholesale_customer"],
      category_visibility: ["retail", "wholesale", "both"],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ],
      order_type: ["retail", "wholesale"],
      wholesale_account_status: ["pending", "approved", "rejected"],
      wholesale_tier: ["standard", "premium", "enterprise"],
    },
  },
} as const
