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
      articles: {
        Row: {
          id: string
          title: string
          summary: string
          created_at: string
          published_at: string
          category: string
          source: string
          additional_sources?: string[] | null
          tags: string[]
          is_deleted: boolean
          deleted_at?: string | null
          position: number
          is_selected: boolean
          upvotes: number
        }
        Insert: {
          id?: string
          title: string
          summary: string
          created_at?: string
          published_at: string
          category: string
          source: string
          additional_sources?: string[] | null
          tags: string[]
          is_deleted?: boolean
          deleted_at?: string | null
          position?: number
          is_selected?: boolean
          upvotes?: number
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          created_at?: string
          published_at?: string
          category?: string
          source?: string
          additional_sources?: string[] | null
          tags?: string[]
          is_deleted?: boolean
          deleted_at?: string | null
          position?: number
          is_selected?: boolean
          upvotes?: number
        }
      }
      article_votes: {
        Row: {
          id: string
          article_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
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
      [_ in never]: never
    }
  }
}
