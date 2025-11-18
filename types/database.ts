export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'builder' | 'sponsor' | 'judge' | 'admin'

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
          role: UserRole
          company_name: string | null
          cv_url: string | null
          linkedin_url: string | null
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
          role?: UserRole
          company_name?: string | null
          cv_url?: string | null
          linkedin_url?: string | null
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
          role?: UserRole
          company_name?: string | null
          cv_url?: string | null
          linkedin_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      seasons: {
        Row: {
          id: string
          name: string
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_date: string
          end_date: string
          status?: 'upcoming' | 'active' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'active' | 'completed'
          created_at?: string
        }
      }
      challenge_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
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
          category_id: string | null
          sponsor_id: string | null
          prize_amount: number | null
          prize_currency: string | null
          data_pack_url: string | null
          season_id: string | null
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
          category_id?: string | null
          sponsor_id?: string | null
          prize_amount?: number | null
          prize_currency?: string | null
          data_pack_url?: string | null
          season_id?: string | null
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
          category_id?: string | null
          sponsor_id?: string | null
          prize_amount?: number | null
          prize_currency?: string | null
          data_pack_url?: string | null
          season_id?: string | null
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
          llm_score: number | null
          judge_score: number | null
          final_score: number | null
          total_score: number
          score_type: 'llm' | 'judge' | 'hybrid'
          rubric_scores: Json
          repo_analysis: string | null
          deck_analysis: string | null
          video_analysis: string | null
          scored_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          llm_score?: number | null
          judge_score?: number | null
          final_score?: number | null
          score_type?: 'llm' | 'judge' | 'hybrid'
          rubric_scores: Json
          repo_analysis?: string | null
          deck_analysis?: string | null
          video_analysis?: string | null
          scored_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          llm_score?: number | null
          judge_score?: number | null
          final_score?: number | null
          score_type?: 'llm' | 'judge' | 'hybrid'
          rubric_scores?: Json
          repo_analysis?: string | null
          deck_analysis?: string | null
          video_analysis?: string | null
          scored_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string | null
          criteria_type: 'top_percent' | 'category_winner' | 'sponsor_favorite' | 'streak' | 'participation' | 'career_score'
          criteria_value: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon?: string | null
          criteria_type: 'top_percent' | 'category_winner' | 'sponsor_favorite' | 'streak' | 'participation' | 'career_score'
          criteria_value?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string | null
          criteria_type?: 'top_percent' | 'category_winner' | 'sponsor_favorite' | 'streak' | 'participation' | 'career_score'
          criteria_value?: Json | null
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          challenge_id: string | null
          season_id: string | null
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          challenge_id?: string | null
          season_id?: string | null
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          challenge_id?: string | null
          season_id?: string | null
          awarded_at?: string
        }
      }
      judge_reviews: {
        Row: {
          id: string
          submission_id: string
          judge_id: string
          score: number
          feedback: string | null
          rubric_scores: Json | null
          is_sponsor_favorite: boolean
          reviewed_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          judge_id: string
          score: number
          feedback?: string | null
          rubric_scores?: Json | null
          is_sponsor_favorite?: boolean
          reviewed_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          judge_id?: string
          score?: number
          feedback?: string | null
          rubric_scores?: Json | null
          is_sponsor_favorite?: boolean
          reviewed_at?: string
        }
      }
      career_scores: {
        Row: {
          id: string
          user_id: string
          season_id: string | null
          total_score: number
          challenges_completed: number
          avg_score: number | null
          rank: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          season_id?: string | null
          total_score?: number
          challenges_completed?: number
          avg_score?: number | null
          rank?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          season_id?: string | null
          total_score?: number
          challenges_completed?: number
          avg_score?: number | null
          rank?: number | null
          updated_at?: string
        }
      }
      email_notifications: {
        Row: {
          id: string
          user_id: string
          email: string
          subject: string
          template_name: string
          template_data: Json | null
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          subject: string
          template_name: string
          template_data?: Json | null
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          subject?: string
          template_name?: string
          template_data?: Json | null
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error?: string | null
          created_at?: string
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
      leaderboard_enhanced: {
        Row: {
          challenge_id: string
          user_id: string
          full_name: string | null
          github_username: string | null
          avatar_url: string | null
          total_score: number
          llm_score: number | null
          judge_score: number | null
          score_type: string
          submitted_at: string
          repo_url: string
          deck_url: string
          video_url: string
          rank: number
          total_participants: number
          badges: Json | null
        }
      }
    }
    Functions: {}
    Enums: {
      user_role: UserRole
    }
  }
}
