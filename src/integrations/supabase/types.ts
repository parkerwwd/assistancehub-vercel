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
      pha_agencies: {
        Row: {
          acc_units: number | null
          address: string | null
          capfund_amount: number | null
          combined_size_category: string | null
          created_at: string
          email: string | null
          exec_dir_email: string | null
          exec_dir_fax: string | null
          exec_dir_phone: string | null
          fax: string | null
          fiscal_year_end: string | null
          id: string
          last_updated: string | null
          low_rent_size_category: string | null
          name: string
          number_reported: number | null
          opfund_amount: number | null
          opfund_amount_prev_yr: number | null
          pct_occupied: number | null
          pct_reported: number | null
          ph_occupied: number | null
          pha_code: string | null
          pha_total_units: number | null
          phas_designation: string | null
          phone: string | null
          program_type: string | null
          regular_vacant: number | null
          section8_occupied: number | null
          section8_size_category: string | null
          section8_units_count: number | null
          total_dwelling_units: number | null
          total_occupied: number | null
          total_units: number | null
        }
        Insert: {
          acc_units?: number | null
          address?: string | null
          capfund_amount?: number | null
          combined_size_category?: string | null
          created_at?: string
          email?: string | null
          exec_dir_email?: string | null
          exec_dir_fax?: string | null
          exec_dir_phone?: string | null
          fax?: string | null
          fiscal_year_end?: string | null
          id?: string
          last_updated?: string | null
          low_rent_size_category?: string | null
          name: string
          number_reported?: number | null
          opfund_amount?: number | null
          opfund_amount_prev_yr?: number | null
          pct_occupied?: number | null
          pct_reported?: number | null
          ph_occupied?: number | null
          pha_code?: string | null
          pha_total_units?: number | null
          phas_designation?: string | null
          phone?: string | null
          program_type?: string | null
          regular_vacant?: number | null
          section8_occupied?: number | null
          section8_size_category?: string | null
          section8_units_count?: number | null
          total_dwelling_units?: number | null
          total_occupied?: number | null
          total_units?: number | null
        }
        Update: {
          acc_units?: number | null
          address?: string | null
          capfund_amount?: number | null
          combined_size_category?: string | null
          created_at?: string
          email?: string | null
          exec_dir_email?: string | null
          exec_dir_fax?: string | null
          exec_dir_phone?: string | null
          fax?: string | null
          fiscal_year_end?: string | null
          id?: string
          last_updated?: string | null
          low_rent_size_category?: string | null
          name?: string
          number_reported?: number | null
          opfund_amount?: number | null
          opfund_amount_prev_yr?: number | null
          pct_occupied?: number | null
          pct_reported?: number | null
          ph_occupied?: number | null
          pha_code?: string | null
          pha_total_units?: number | null
          phas_designation?: string | null
          phone?: string | null
          program_type?: string | null
          regular_vacant?: number | null
          section8_occupied?: number | null
          section8_size_category?: string | null
          section8_units_count?: number | null
          total_dwelling_units?: number | null
          total_occupied?: number | null
          total_units?: number | null
        }
        Relationships: []
      }
      pha_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
