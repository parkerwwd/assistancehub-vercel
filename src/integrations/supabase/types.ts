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
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          latitude: number | null
          longitude: number | null
          website: string | null
          supports_hcv: boolean
          waitlist_open: boolean | null
          waitlist_status: string | null
          jurisdictions: string[] | null
          last_updated: string
          created_at: string
          email: string | null
          exec_dir_email: string | null
          id: string
          name: string
          pha_code: string | null
          phone: string | null
          program_type: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          latitude?: number | null
          longitude?: number | null
          website?: string | null
          supports_hcv?: boolean
          waitlist_open?: boolean | null
          waitlist_status?: string | null
          jurisdictions?: string[] | null
          last_updated?: string
          created_at?: string
          email?: string | null
          exec_dir_email?: string | null
          id?: string
          name: string
          pha_code?: string | null
          phone?: string | null
          program_type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          latitude?: number | null
          longitude?: number | null
          website?: string | null
          supports_hcv?: boolean
          waitlist_open?: boolean | null
          waitlist_status?: string | null
          jurisdictions?: string[] | null
          last_updated?: string
          created_at?: string
          email?: string | null
          exec_dir_email?: string | null
          id?: string
          name?: string
          pha_code?: string | null
          phone?: string | null
          program_type?: string | null
          updated_at?: string
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
      properties: {
        Row: {
          id: string
          pha_id: string | null
          name: string
          address: string
          city: string | null
          state: string | null
          zip: string | null
          property_type: string | null
          units_total: number | null
          units_available: number | null
          bedroom_types: string[] | null
          rent_range_min: number | null
          rent_range_max: number | null
          phone: string | null
          email: string | null
          website: string | null
          accessibility_features: string[] | null
          amenities: string[] | null
          pet_policy: string | null
          smoking_policy: string | null
          latitude: number | null
          longitude: number | null
          last_updated: string
          created_at: string
          year_put_in_service: number | null
          low_income_units: number | null
          units_studio: number | null
          units_1br: number | null
          units_2br: number | null
          units_3br: number | null
          units_4br: number | null
        }
        Insert: {
          id?: string
          pha_id?: string | null
          name: string
          address: string
          city?: string | null
          state?: string | null
          zip?: string | null
          property_type?: string | null
          units_total?: number | null
          units_available?: number | null
          bedroom_types?: string[] | null
          rent_range_min?: number | null
          rent_range_max?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          accessibility_features?: string[] | null
          amenities?: string[] | null
          pet_policy?: string | null
          smoking_policy?: string | null
          latitude?: number | null
          longitude?: number | null
          last_updated?: string
          created_at?: string
          year_put_in_service?: number | null
          low_income_units?: number | null
          units_studio?: number | null
          units_1br?: number | null
          units_2br?: number | null
          units_3br?: number | null
          units_4br?: number | null
        }
        Update: {
          id?: string
          pha_id?: string | null
          name?: string
          address?: string
          city?: string | null
          state?: string | null
          zip?: string | null
          property_type?: string | null
          units_total?: number | null
          units_available?: number | null
          bedroom_types?: string[] | null
          rent_range_min?: number | null
          rent_range_max?: number | null
          phone?: string | null
          email?: string | null
          website?: string | null
          accessibility_features?: string[] | null
          amenities?: string[] | null
          pet_policy?: string | null
          smoking_policy?: string | null
          latitude?: number | null
          longitude?: number | null
          last_updated?: string
          created_at?: string
          year_put_in_service?: number | null
          low_income_units?: number | null
          units_studio?: number | null
          units_1br?: number | null
          units_2br?: number | null
          units_3br?: number | null
          units_4br?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_pha_id_fkey"
            columns: ["pha_id"]
            referencedRelation: "pha_agencies"
            referencedColumns: ["id"]
          }
        ]
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
