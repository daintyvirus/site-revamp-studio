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
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      delivery_logs: {
        Row: {
          action: string
          created_at: string
          customer_ip: string | null
          delivery_info_snapshot: string | null
          error_message: string | null
          id: string
          order_id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          customer_ip?: string | null
          delivery_info_snapshot?: string | null
          error_message?: string | null
          id?: string
          order_id: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          customer_ip?: string | null
          delivery_info_snapshot?: string | null
          error_message?: string | null
          id?: string
          order_id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          order_id: string | null
          recipient_email: string
          sent_at: string
          status: string
          subject: string
          template_type: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          recipient_email: string
          sent_at?: string
          status?: string
          subject: string
          template_type: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          order_id?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
          template_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          background_color: string | null
          body_content: string | null
          body_intro: string
          button_color: string | null
          button_text_color: string | null
          closing_text: string
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          custom_css: string | null
          delivery_disclaimer: string | null
          footer_background_color: string | null
          footer_text: string | null
          greeting_format: string
          header_color: string
          header_title: string
          help_center_url: string | null
          id: string
          is_active: boolean
          order_id_label: string
          order_total_label: string
          refund_policy: string | null
          sender_email: string
          sender_name: string
          show_order_details: boolean
          show_tracking_button: boolean
          signature_name: string
          social_links: Json | null
          status_label: string
          status_type: string
          subject_template: string
          support_email: string | null
          support_hours: string | null
          text_color: string | null
          tracking_button_text: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          body_content?: string | null
          body_intro: string
          button_color?: string | null
          button_text_color?: string | null
          closing_text?: string
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          custom_css?: string | null
          delivery_disclaimer?: string | null
          footer_background_color?: string | null
          footer_text?: string | null
          greeting_format?: string
          header_color?: string
          header_title: string
          help_center_url?: string | null
          id?: string
          is_active?: boolean
          order_id_label?: string
          order_total_label?: string
          refund_policy?: string | null
          sender_email?: string
          sender_name?: string
          show_order_details?: boolean
          show_tracking_button?: boolean
          signature_name?: string
          social_links?: Json | null
          status_label?: string
          status_type: string
          subject_template: string
          support_email?: string | null
          support_hours?: string | null
          text_color?: string | null
          tracking_button_text?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          body_content?: string | null
          body_intro?: string
          button_color?: string | null
          button_text_color?: string | null
          closing_text?: string
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          custom_css?: string | null
          delivery_disclaimer?: string | null
          footer_background_color?: string | null
          footer_text?: string | null
          greeting_format?: string
          header_color?: string
          header_title?: string
          help_center_url?: string | null
          id?: string
          is_active?: boolean
          order_id_label?: string
          order_total_label?: string
          refund_policy?: string | null
          sender_email?: string
          sender_name?: string
          show_order_details?: boolean
          show_tracking_button?: boolean
          signature_name?: string
          social_links?: Json | null
          status_label?: string
          status_type?: string
          subject_template?: string
          support_email?: string | null
          support_hours?: string | null
          text_color?: string | null
          tracking_button_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          badge_text: string | null
          button_text: string | null
          button_url: string | null
          created_at: string
          description: string | null
          extra_data: Json | null
          id: string
          is_visible: boolean
          secondary_button_text: string | null
          secondary_button_url: string | null
          section_key: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          description?: string | null
          extra_data?: Json | null
          id?: string
          is_visible?: boolean
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          section_key: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          description?: string | null
          extra_data?: Json | null
          id?: string
          is_visible?: boolean
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          section_key?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      navigation_menu: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          location: string
          open_in_new_tab: boolean
          parent_id: string | null
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          location?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          location?: string
          open_in_new_tab?: boolean
          parent_id?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_menu_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_menu"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_email_sent: boolean | null
          delivery_info: string | null
          delivery_instructions: string | null
          delivery_platform: string | null
          delivery_type: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          status: string
          total: number
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_email_sent?: boolean | null
          delivery_info?: string | null
          delivery_instructions?: string | null
          delivery_platform?: string | null
          delivery_type?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          status?: string
          total: number
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_email_sent?: boolean | null
          delivery_info?: string | null
          delivery_instructions?: string | null
          delivery_platform?: string | null
          delivery_type?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          status?: string
          total?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_name: string | null
          account_number: string
          available_currencies: string[] | null
          created_at: string
          id: string
          instructions: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number: string
          available_currencies?: string[] | null
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string
          available_currencies?: string[] | null
          created_at?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          price_bdt: number | null
          product_id: string
          sale_price: number | null
          sale_price_bdt: number | null
          stock: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: number
          price_bdt?: number | null
          product_id: string
          sale_price?: number | null
          sale_price_bdt?: number | null
          stock?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          price_bdt?: number | null
          product_id?: string
          sale_price?: number | null
          sale_price_bdt?: number | null
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          flash_sale_enabled: boolean
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          name: string
          price: number
          price_bdt: number | null
          sale_end_date: string | null
          sale_price: number | null
          sale_price_bdt: number | null
          sale_start_date: string | null
          short_description: string | null
          slug: string
          stock: number
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          flash_sale_enabled?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name: string
          price: number
          price_bdt?: number | null
          sale_end_date?: string | null
          sale_price?: number | null
          sale_price_bdt?: number | null
          sale_start_date?: string | null
          short_description?: string | null
          slug: string
          stock?: number
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          flash_sale_enabled?: boolean
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          price_bdt?: number | null
          sale_end_date?: string | null
          sale_price?: number | null
          sale_price_bdt?: number | null
          sale_start_date?: string | null
          short_description?: string | null
          slug?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotional_banners: {
        Row: {
          background_color: string | null
          countdown_enabled: boolean
          countdown_end_time: string | null
          countdown_label: string | null
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          starts_at: string | null
          text: string
          text_color: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          countdown_enabled?: boolean
          countdown_end_time?: string | null
          countdown_label?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          starts_at?: string | null
          text: string
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          countdown_enabled?: boolean
          countdown_end_time?: string | null
          countdown_label?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          starts_at?: string | null
          text?: string
          text_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          label: string
          setting_key: string
          setting_type: string
          setting_value: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          label: string
          setting_key: string
          setting_type?: string
          setting_value?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          setting_key?: string
          setting_type?: string
          setting_value?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          customer_avatar: string | null
          customer_name: string
          id: string
          is_active: boolean
          is_featured: boolean
          product_name: string | null
          rating: number
          review_text: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_avatar?: string | null
          customer_name: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          product_name?: string | null
          rating?: number
          review_text: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_avatar?: string | null
          customer_name?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          product_name?: string | null
          rating?: number
          review_text?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
