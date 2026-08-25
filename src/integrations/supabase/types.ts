export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  zicca: {
    Tables: {
      certifications: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          issuer: string | null;
          logo_url: string | null;
          pdf_url: string | null;
          published: boolean;
          sort_order: number;
          title: string;
          updated_at: string;
          year: number | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          issuer?: string | null;
          logo_url?: string | null;
          pdf_url?: string | null;
          published?: boolean;
          sort_order?: number;
          title: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          issuer?: string | null;
          logo_url?: string | null;
          pdf_url?: string | null;
          published?: boolean;
          sort_order?: number;
          title?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [];
      };
      custom_sections: {
        Row: {
          background_style: string;
          body: string | null;
          created_at: string;
          cta_label: string | null;
          cta_url: string | null;
          eyebrow: string | null;
          heading_level: number;
          id: string;
          image_position: string;
          image_url: string | null;
          page_location: string;
          published: boolean;
          sort_order: number;
          subtitle: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          background_style?: string;
          body?: string | null;
          created_at?: string;
          cta_label?: string | null;
          cta_url?: string | null;
          eyebrow?: string | null;
          heading_level?: number;
          id?: string;
          image_position?: string;
          image_url?: string | null;
          page_location?: string;
          published?: boolean;
          sort_order?: number;
          subtitle?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          background_style?: string;
          body?: string | null;
          created_at?: string;
          cta_label?: string | null;
          cta_url?: string | null;
          eyebrow?: string | null;
          heading_level?: number;
          id?: string;
          image_position?: string;
          image_url?: string | null;
          page_location?: string;
          published?: boolean;
          sort_order?: number;
          subtitle?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          company: string | null;
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          notes: string | null;
          phone: string | null;
          status: Database["zicca"]["Enums"]["lead_status"];
          subject: string | null;
          updated_at: string;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          status?: Database["zicca"]["Enums"]["lead_status"];
          subject?: string | null;
          updated_at?: string;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          status?: Database["zicca"]["Enums"]["lead_status"];
          subject?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          category: string | null;
          client: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          location: string | null;
          published: boolean;
          sort_order: number;
          title: string;
          updated_at: string;
          year: number | null;
        };
        Insert: {
          category?: string | null;
          client?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          published?: boolean;
          sort_order?: number;
          title: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          category?: string | null;
          client?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          published?: boolean;
          sort_order?: number;
          title?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [];
      };
      sectors: {
        Row: {
          bullets: Json;
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          image_url: string | null;
          published: boolean;
          slug: string;
          sort_order: number;
          tagline: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          bullets?: Json;
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          published?: boolean;
          slug: string;
          sort_order?: number;
          tagline?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          bullets?: Json;
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          image_url?: string | null;
          published?: boolean;
          slug?: string;
          sort_order?: number;
          tagline?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["zicca"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["zicca"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["zicca"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_first_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["zicca"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      submit_lead: {
        Args: {
          _company?: string | null;
          _email: string;
          _message: string;
          _name: string;
          _phone?: string | null;
          _subject?: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "admin";
      lead_status: "new" | "in_progress" | "closed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "zicca">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  zicca: {
    Enums: {
      app_role: ["admin"],
      lead_status: ["new", "in_progress", "closed"],
    },
  },
} as const;
