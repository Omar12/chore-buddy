/**
 * Database types representing the Supabase schema
 * These types mirror the database tables and relationships
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          family_id: string
          user_id: string | null
          name: string
          avatar_url: string | null
          role: 'owner' | 'parent' | 'helper' | 'kid'
          pin_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id?: string | null
          name: string
          avatar_url?: string | null
          role: 'owner' | 'parent' | 'helper' | 'kid'
          pin_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string | null
          name?: string
          avatar_url?: string | null
          role?: 'owner' | 'parent' | 'helper' | 'kid'
          pin_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chores: {
        Row: {
          id: string
          family_id: string
          assigned_to_profile_id: string
          title: string
          description: string | null
          points_value: number
          due_date: string | null
          recurrence_rule: string | null
          status: 'not_started' | 'in_progress' | 'done' | 'pending_review' | 'completed'
          created_by_profile_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          assigned_to_profile_id: string
          title: string
          description?: string | null
          points_value: number
          due_date?: string | null
          recurrence_rule?: string | null
          status?: 'not_started' | 'in_progress' | 'done' | 'pending_review' | 'completed'
          created_by_profile_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          assigned_to_profile_id?: string
          title?: string
          description?: string | null
          points_value?: number
          due_date?: string | null
          recurrence_rule?: string | null
          status?: 'not_started' | 'in_progress' | 'done' | 'pending_review' | 'completed'
          created_by_profile_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      chore_comments: {
        Row: {
          id: string
          chore_id: string
          profile_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          chore_id: string
          profile_id: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          chore_id?: string
          profile_id?: string
          comment?: string
          created_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          family_id: string
          name: string
          description: string | null
          points_cost: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          description?: string | null
          points_cost: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          description?: string | null
          points_cost?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reward_redemptions: {
        Row: {
          id: string
          reward_id: string
          profile_id: string
          status: 'requested' | 'approved' | 'redeemed' | 'rejected'
          requested_at: string
          resolved_at: string | null
          resolved_by_profile_id: string | null
        }
        Insert: {
          id?: string
          reward_id: string
          profile_id: string
          status?: 'requested' | 'approved' | 'redeemed' | 'rejected'
          requested_at?: string
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
        }
        Update: {
          id?: string
          reward_id?: string
          profile_id?: string
          status?: 'requested' | 'approved' | 'redeemed' | 'rejected'
          requested_at?: string
          resolved_at?: string | null
          resolved_by_profile_id?: string | null
        }
      }
      points_transactions: {
        Row: {
          id: string
          profile_id: string
          amount: number
          reason: 'chore_completion' | 'reward_redemption' | 'manual_adjustment'
          related_chore_id: string | null
          related_redemption_id: string | null
          notes: string | null
          created_by_profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          amount: number
          reason: 'chore_completion' | 'reward_redemption' | 'manual_adjustment'
          related_chore_id?: string | null
          related_redemption_id?: string | null
          notes?: string | null
          created_by_profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          amount?: number
          reason?: 'chore_completion' | 'reward_redemption' | 'manual_adjustment'
          related_chore_id?: string | null
          related_redemption_id?: string | null
          notes?: string | null
          created_by_profile_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      profile_role: 'owner' | 'parent' | 'helper' | 'kid'
      chore_status: 'not_started' | 'in_progress' | 'done' | 'pending_review' | 'completed'
      redemption_status: 'requested' | 'approved' | 'redeemed' | 'rejected'
      transaction_reason: 'chore_completion' | 'reward_redemption' | 'manual_adjustment'
    }
  }
}
