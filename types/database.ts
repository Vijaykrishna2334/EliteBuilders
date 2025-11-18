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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          github_username: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          github_username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          github_username?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          deliverables: Json
          rubric: Json
          deadline: string | null
          status: 'draft' | 'active' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          deliverables: Json
          rubric: Json
          deadline?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          deliverables?: Json
          rubric?: Json
          deadline?: string | null
          status?: 'draft' | 'active' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      challenge_participants: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          started_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          started_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          started_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          repo_url: string
          deck_url: string
          video_url: string
          status: 'pending' | 'scoring' | 'scored' | 'failed'
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          repo_url: string
          deck_url: string
          video_url: string
          status?: 'pending' | 'scoring' | 'scored' | 'failed'
          submitted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          repo_url?: string
          deck_url?: string
          video_url?: string
          status?: 'pending' | 'scoring' | 'scored' | 'failed'
          submitted_at?: string
        }
      }
      scores: {
        Row: {
          id: string
          submission_id: string
          total_score: number
          rubric_scores: Json
          repo_analysis: string | null
          deck_analysis: string | null
          video_analysis: string | null
          scored_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          total_score: number
          rubric_scores: Json
          repo_analysis?: string | null
          deck_analysis?: string | null
          video_analysis?: string | null
          scored_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          total_score?: number
          rubric_scores?: Json
          repo_analysis?: string | null
          deck_analysis?: string | null
          video_analysis?: string | null
          scored_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          submission_id: string
          reporter_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed'
          created_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          submission_id: string
          reporter_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          submission_id?: string
          reporter_id?: string
          reason?: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          created_at?: string
          reviewed_at?: string | null
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          challenge_id: string
          user_id: string
          full_name: string | null
          github_username: string | null
          avatar_url: string | null
          total_score: number
          submitted_at: string
          repo_url: string
          deck_url: string
          video_url: string
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}
