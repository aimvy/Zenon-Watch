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
