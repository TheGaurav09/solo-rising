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
      achievements: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          points_required: number
        }
        Insert: {
          description: string
          icon: string
          id?: string
          name: string
          points_required: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number
        }
        Relationships: []
      }
      badges: {
        Row: {
          description: string
          icon: string
          id: string
          image_path: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          description: string
          icon: string
          id?: string
          image_path: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          image_path?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      character_counts: {
        Row: {
          character_type: string
          count: number
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          character_type: string
          count?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          character_type?: string
          count?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          scheduled_for: string
          task: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          scheduled_for: string
          task: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          scheduled_for?: string
          task?: string
          user_id?: string
        }
        Relationships: []
      }
      store_items: {
        Row: {
          description: string
          icon: string
          id: string
          item_type: string
          name: string
          price: number
        }
        Insert: {
          description: string
          icon: string
          id?: string
          item_type: string
          name: string
          price: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          item_type?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_items: {
        Row: {
          id: string
          item_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_showcase: {
        Row: {
          created_at: string
          id: string
          items: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          character_type: string
          coins: number | null
          country: string | null
          created_at: string
          email: string
          id: string
          last_workout_date: string | null
          last_workout_time: string | null
          level: number | null
          password: string
          points: number
          streak: number | null
          warrior_name: string
          xp: number | null
        }
        Insert: {
          character_type: string
          coins?: number | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          last_workout_date?: string | null
          last_workout_time?: string | null
          level?: number | null
          password: string
          points?: number
          streak?: number | null
          warrior_name: string
          xp?: number | null
        }
        Update: {
          character_type?: string
          coins?: number | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          last_workout_date?: string | null
          last_workout_time?: string | null
          level?: number | null
          password?: string
          points?: number
          streak?: number | null
          warrior_name?: string
          xp?: number | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          created_at: string
          duration: number
          exercise_type: string
          id: string
          points: number
          reps: number
          user_id: string
        }
        Insert: {
          created_at?: string
          duration: number
          exercise_type: string
          id?: string
          points: number
          reps: number
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          exercise_type?: string
          id?: string
          points?: number
          reps?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      character_selection_counts: {
        Row: {
          character_type: string | null
          count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_workout_stats_by_type: {
        Args: {
          user_id_param: string
        }
        Returns: {
          exercise_type: string
          count: number
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
