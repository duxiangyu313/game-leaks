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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activation_codes: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          game_name: string | null
          id: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          game_name?: string | null
          id?: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          game_name?: string | null
          id?: string
        }
        Relationships: []
      }
      active_visitors: {
        Row: {
          id: string
          last_seen: string | null
          session_id: string
        }
        Insert: {
          id?: string
          last_seen?: string | null
          session_id: string
        }
        Update: {
          id?: string
          last_seen?: string | null
          session_id?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          created_at: string | null
          detail: string | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          detail?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          detail?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      anonymous_submissions: {
        Row: {
          content: string | null
          created_at: string | null
          credibility: string | null
          game_name: string | null
          id: string
          reviewed_at: string | null
          reviewer_note: string | null
          reward_tier: Database["public"]["Enums"]["membership_tier"] | null
          status: string | null
          submitter_fingerprint: string | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          credibility?: string | null
          game_name?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_note?: string | null
          reward_tier?: Database["public"]["Enums"]["membership_tier"] | null
          status?: string | null
          submitter_fingerprint?: string | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          credibility?: string | null
          game_name?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_note?: string | null
          reward_tier?: Database["public"]["Enums"]["membership_tier"] | null
          status?: string | null
          submitter_fingerprint?: string | null
          title?: string
        }
        Relationships: []
      }
      article_interactions: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_interactions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          can_delete_after: string | null
          category: string | null
          content: string | null
          content_level: Database["public"]["Enums"]["content_level"] | null
          cover_image: string | null
          created_at: string | null
          creator_id: string | null
          excerpt: string | null
          id: string
          is_ugc: boolean | null
          required_tier: Database["public"]["Enums"]["membership_tier"] | null
          revenue_split: number | null
          scheduled_at: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          can_delete_after?: string | null
          category?: string | null
          content?: string | null
          content_level?: Database["public"]["Enums"]["content_level"] | null
          cover_image?: string | null
          created_at?: string | null
          creator_id?: string | null
          excerpt?: string | null
          id?: string
          is_ugc?: boolean | null
          required_tier?: Database["public"]["Enums"]["membership_tier"] | null
          revenue_split?: number | null
          scheduled_at?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          can_delete_after?: string | null
          category?: string | null
          content?: string | null
          content_level?: Database["public"]["Enums"]["content_level"] | null
          cover_image?: string | null
          created_at?: string | null
          creator_id?: string | null
          excerpt?: string | null
          id?: string
          is_ugc?: boolean | null
          required_tier?: Database["public"]["Enums"]["membership_tier"] | null
          revenue_split?: number | null
          scheduled_at?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      auto_update_logs: {
        Row: {
          created_at: string | null
          errors: string[] | null
          games_released: string[] | null
          games_updated: number | null
          id: string
          leaks_published: number | null
          memberships_expired: number | null
          run_at: string
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          errors?: string[] | null
          games_released?: string[] | null
          games_updated?: number | null
          id?: string
          leaks_published?: number | null
          memberships_expired?: number | null
          run_at?: string
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          errors?: string[] | null
          games_released?: string[] | null
          games_updated?: number | null
          id?: string
          leaks_published?: number | null
          memberships_expired?: number | null
          run_at?: string
          success?: boolean | null
        }
        Relationships: []
      }
      banned_accounts: {
        Row: {
          banned_at: string | null
          banned_by: string | null
          forfeited_amount: number | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_at?: string | null
          banned_by?: string | null
          forfeited_amount?: number | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_at?: string | null
          banned_by?: string | null
          forfeited_amount?: number | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      content_access: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          required_tier: Database["public"]["Enums"]["membership_tier"] | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          required_tier?: Database["public"]["Enums"]["membership_tier"] | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          required_tier?: Database["public"]["Enums"]["membership_tier"] | null
        }
        Relationships: []
      }
      device_sessions: {
        Row: {
          created_at: string | null
          device_fingerprint: string
          id: string
          last_seen: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_fingerprint: string
          id?: string
          last_seen?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string
          id?: string
          last_seen?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          confirmed: boolean | null
          created_at: string | null
          email: string
          game_ids: string[] | null
          id: string
          send_all: boolean | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string | null
          email: string
          game_ids?: string[] | null
          id?: string
          send_all?: boolean | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string | null
          email?: string
          game_ids?: string[] | null
          id?: string
          send_all?: boolean | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_name: string | null
          category: string
          content: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          reply_count: number | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          reply_count?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          reply_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_name: string | null
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          author_name?: string | null
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          author_name?: string | null
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      game_comments: {
        Row: {
          content: string
          created_at: string | null
          game_id: string
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          game_id: string
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          game_id?: string
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_comments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_dlc: {
        Row: {
          created_at: string | null
          description: string | null
          dlc_type: string | null
          game_id: string
          id: string
          image_url: string | null
          price: string | null
          release_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dlc_type?: string | null
          game_id: string
          id?: string
          image_url?: string | null
          price?: string | null
          release_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dlc_type?: string | null
          game_id?: string
          id?: string
          image_url?: string | null
          price?: string | null
          release_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_dlc_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_events: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          game_id: string | null
          id: string
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type: string
          game_id?: string | null
          id?: string
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          game_id?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_events_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_preorders: {
        Row: {
          bonus: string | null
          created_at: string | null
          currency: string | null
          edition: string
          game_id: string
          id: string
          is_available: boolean | null
          platform: string
          price: number
          purchase_link: string | null
        }
        Insert: {
          bonus?: string | null
          created_at?: string | null
          currency?: string | null
          edition: string
          game_id: string
          id?: string
          is_available?: boolean | null
          platform: string
          price: number
          purchase_link?: string | null
        }
        Update: {
          bonus?: string | null
          created_at?: string | null
          currency?: string | null
          edition?: string
          game_id?: string
          id?: string
          is_available?: boolean | null
          platform?: string
          price?: number
          purchase_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_preorders_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_prices: {
        Row: {
          created_at: string | null
          currency: string | null
          current_price: number | null
          discount_percent: number | null
          game_id: string
          id: string
          lowest_price: number | null
          original_price: number | null
          platform: string
          recorded_at: string | null
          store: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          discount_percent?: number | null
          game_id: string
          id?: string
          lowest_price?: number | null
          original_price?: number | null
          platform: string
          recorded_at?: string | null
          store: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          discount_percent?: number | null
          game_id?: string
          id?: string
          lowest_price?: number | null
          original_price?: number | null
          platform?: string
          recorded_at?: string | null
          store?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_prices_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_progress: {
        Row: {
          cover_url: string | null
          created_at: string | null
          credibility_score: number | null
          developer: string | null
          development_stage: string
          estimated_release_date: string | null
          genre: string | null
          gold_info: string | null
          id: string
          is_featured: boolean | null
          last_updated: string | null
          name: string
          public_info: string | null
          publisher: string | null
          risk_assessment: string | null
          silver_info: string | null
          tags: string[] | null
          team_size: number | null
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          credibility_score?: number | null
          developer?: string | null
          development_stage?: string
          estimated_release_date?: string | null
          genre?: string | null
          gold_info?: string | null
          id?: string
          is_featured?: boolean | null
          last_updated?: string | null
          name: string
          public_info?: string | null
          publisher?: string | null
          risk_assessment?: string | null
          silver_info?: string | null
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          credibility_score?: number | null
          developer?: string | null
          development_stage?: string
          estimated_release_date?: string | null
          genre?: string | null
          gold_info?: string | null
          id?: string
          is_featured?: boolean | null
          last_updated?: string | null
          name?: string
          public_info?: string | null
          publisher?: string | null
          risk_assessment?: string | null
          silver_info?: string | null
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      game_requirements: {
        Row: {
          cpu_min: string | null
          cpu_rec: string | null
          created_at: string | null
          directx: string | null
          game_id: string
          gpu_min: string | null
          gpu_rec: string | null
          id: string
          notes: string | null
          os_min: string | null
          os_rec: string | null
          ram_min: string | null
          ram_rec: string | null
          storage_min: string | null
          storage_rec: string | null
        }
        Insert: {
          cpu_min?: string | null
          cpu_rec?: string | null
          created_at?: string | null
          directx?: string | null
          game_id: string
          gpu_min?: string | null
          gpu_rec?: string | null
          id?: string
          notes?: string | null
          os_min?: string | null
          os_rec?: string | null
          ram_min?: string | null
          ram_rec?: string | null
          storage_min?: string | null
          storage_rec?: string | null
        }
        Update: {
          cpu_min?: string | null
          cpu_rec?: string | null
          created_at?: string | null
          directx?: string | null
          game_id?: string
          gpu_min?: string | null
          gpu_rec?: string | null
          id?: string
          notes?: string | null
          os_min?: string | null
          os_rec?: string | null
          ram_min?: string | null
          ram_rec?: string | null
          storage_min?: string | null
          storage_rec?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_requirements_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_reviews: {
        Row: {
          cons: string | null
          content: string
          created_at: string | null
          game_id: string
          helpful_count: number | null
          id: string
          images: Json | null
          is_editor_pick: boolean | null
          is_featured: boolean | null
          platform: string | null
          playtime_hours: number | null
          pros: string | null
          rating: number | null
          title: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          cons?: string | null
          content: string
          created_at?: string | null
          game_id: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_editor_pick?: boolean | null
          is_featured?: boolean | null
          platform?: string | null
          playtime_hours?: number | null
          pros?: string | null
          rating?: number | null
          title?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          cons?: string | null
          content?: string
          created_at?: string | null
          game_id?: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_editor_pick?: boolean | null
          is_featured?: boolean | null
          platform?: string | null
          playtime_hours?: number | null
          pros?: string | null
          rating?: number | null
          title?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_reviews_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_votes: {
        Row: {
          created_at: string | null
          game_id: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          game_id: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          game_id?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_votes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_wiki: {
        Row: {
          background: string | null
          characters: Json | null
          created_at: string | null
          developer_notes: string | null
          game_id: string
          id: string
          last_edited_by: string | null
          maps: Json | null
          updated_at: string | null
          weapons: Json | null
          worldview: string | null
        }
        Insert: {
          background?: string | null
          characters?: Json | null
          created_at?: string | null
          developer_notes?: string | null
          game_id: string
          id?: string
          last_edited_by?: string | null
          maps?: Json | null
          updated_at?: string | null
          weapons?: Json | null
          worldview?: string | null
        }
        Update: {
          background?: string | null
          characters?: Json | null
          created_at?: string | null
          developer_notes?: string | null
          game_id?: string
          id?: string
          last_edited_by?: string | null
          maps?: Json | null
          updated_at?: string | null
          weapons?: Json | null
          worldview?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_wiki_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_wiki_edits: {
        Row: {
          admin_note: string | null
          created_at: string | null
          field_name: string
          game_id: string
          id: string
          new_value: string
          old_value: string | null
          reviewed_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string | null
          field_name: string
          game_id: string
          id?: string
          new_value: string
          old_value?: string | null
          reviewed_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string | null
          field_name?: string
          game_id?: string
          id?: string
          new_value?: string
          old_value?: string | null
          reviewed_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_wiki_edits_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          cover: string | null
          created_at: string | null
          description: string | null
          developer: string | null
          english_title: string | null
          genre: string[] | null
          hype_score: number | null
          id: string
          platforms: string[] | null
          publisher: string | null
          rating: number | null
          release_date: string | null
          scale: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover?: string | null
          created_at?: string | null
          description?: string | null
          developer?: string | null
          english_title?: string | null
          genre?: string[] | null
          hype_score?: number | null
          id?: string
          platforms?: string[] | null
          publisher?: string | null
          rating?: number | null
          release_date?: string | null
          scale?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover?: string | null
          created_at?: string | null
          description?: string | null
          developer?: string | null
          english_title?: string | null
          genre?: string[] | null
          hype_score?: number | null
          id?: string
          platforms?: string[] | null
          publisher?: string | null
          rating?: number | null
          release_date?: string | null
          scale?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ip_registrations: {
        Row: {
          id: string
          ip_hash: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          ip_hash: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          ip_hash?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaks: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          credibility: string | null
          game_id: string | null
          game_name: string | null
          id: string
          images: string[] | null
          published_at: string | null
          scheduled_at: string | null
          source: string | null
          status: string | null
          summary: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          credibility?: string | null
          game_id?: string | null
          game_name?: string | null
          id?: string
          images?: string[] | null
          published_at?: string | null
          scheduled_at?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          credibility?: string | null
          game_id?: string | null
          game_name?: string | null
          id?: string
          images?: string[] | null
          published_at?: string | null
          scheduled_at?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leaks_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          related_referral_id: string | null
          status: string | null
          stripe_invoice_id: string | null
          stripe_session_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          related_referral_id?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_session_id?: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          related_referral_id?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_session_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string | null
          id: string
          paragraph_index: number | null
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string | null
          id?: string
          paragraph_index?: number | null
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string | null
          id?: string
          paragraph_index?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      preorder_subscriptions: {
        Row: {
          created_at: string | null
          email: string
          game_id: string
          id: string
          notified: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          game_id: string
          id?: string
          notified?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          game_id?: string
          id?: string
          notified?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preorder_subscriptions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          banned: boolean | null
          created_at: string | null
          id: string
          ip_hash: string | null
          membership: Database["public"]["Enums"]["membership_tier"] | null
          referral_code: string | null
          referrer_id: string | null
          revenue_balance: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          total_earned: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          banned?: boolean | null
          created_at?: string | null
          id: string
          ip_hash?: string | null
          membership?: Database["public"]["Enums"]["membership_tier"] | null
          referral_code?: string | null
          referrer_id?: string | null
          revenue_balance?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          total_earned?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar?: string | null
          banned?: boolean | null
          created_at?: string | null
          id?: string
          ip_hash?: string | null
          membership?: Database["public"]["Enums"]["membership_tier"] | null
          referral_code?: string | null
          referrer_id?: string | null
          revenue_balance?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          total_earned?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      promotion_claims: {
        Row: {
          claimed_at: string | null
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      promotion_config: {
        Row: {
          claimed_count: number
          id: number
          is_active: boolean
          reward_duration_days: number
          reward_tier: string
          started_at: string | null
          total_slots: number
          updated_at: string | null
        }
        Insert: {
          claimed_count?: number
          id?: number
          is_active?: boolean
          reward_duration_days?: number
          reward_tier?: string
          started_at?: string | null
          total_slots?: number
          updated_at?: string | null
        }
        Update: {
          claimed_count?: number
          id?: number
          is_active?: boolean
          reward_duration_days?: number
          reward_tier?: string
          started_at?: string | null
          total_slots?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      referral_records: {
        Row: {
          id: string
          invited_at: string | null
          invited_user_id: string | null
          referral_code: string
          referrer_id: string
          reward_applied: boolean | null
          reward_days: number
          reward_expires_at: string | null
        }
        Insert: {
          id?: string
          invited_at?: string | null
          invited_user_id?: string | null
          referral_code: string
          referrer_id: string
          reward_applied?: boolean | null
          reward_days?: number
          reward_expires_at?: string | null
        }
        Update: {
          id?: string
          invited_at?: string | null
          invited_user_id?: string | null
          referral_code?: string
          referrer_id?: string
          reward_applied?: boolean | null
          reward_days?: number
          reward_expires_at?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string | null
          id: string
          payment_id: string | null
          reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          payment_id?: string | null
          reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_records: {
        Row: {
          amount: number
          content_id: string
          content_type: string
          created_at: string | null
          creator_id: string
          id: string
          notes: string | null
          revenue_type: string
          settlement_month: string | null
          settlement_split: number | null
          settlement_status: string | null
        }
        Insert: {
          amount?: number
          content_id: string
          content_type: string
          created_at?: string | null
          creator_id: string
          id?: string
          notes?: string | null
          revenue_type: string
          settlement_month?: string | null
          settlement_split?: number | null
          settlement_status?: string | null
        }
        Update: {
          amount?: number
          content_id?: string
          content_type?: string
          created_at?: string | null
          creator_id?: string
          id?: string
          notes?: string | null
          revenue_type?: string
          settlement_month?: string | null
          settlement_split?: number | null
          settlement_status?: string | null
        }
        Relationships: []
      }
      ugc_content: {
        Row: {
          can_delete_after: string | null
          category: string | null
          comment_count: number | null
          content: string | null
          content_level: Database["public"]["Enums"]["content_level"]
          cover_image: string | null
          created_at: string | null
          game_id: string | null
          game_name: string | null
          id: string
          like_count: number | null
          published_at: string | null
          submission_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          can_delete_after?: string | null
          category?: string | null
          comment_count?: number | null
          content?: string | null
          content_level?: Database["public"]["Enums"]["content_level"]
          cover_image?: string | null
          created_at?: string | null
          game_id?: string | null
          game_name?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          submission_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          can_delete_after?: string | null
          category?: string | null
          comment_count?: number | null
          content?: string | null
          content_level?: Database["public"]["Enums"]["content_level"]
          cover_image?: string | null
          created_at?: string | null
          game_id?: string | null
          game_name?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          submission_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ugc_content_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ugc_content_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "ugc_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      ugc_submissions: {
        Row: {
          category: string | null
          content: string | null
          content_level: Database["public"]["Enums"]["content_level"]
          cover_image: string | null
          game_id: string | null
          game_name: string | null
          id: string
          revenue_split: number | null
          review_note: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string | null
          submitted_at: string | null
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          content_level?: Database["public"]["Enums"]["content_level"]
          cover_image?: string | null
          game_id?: string | null
          game_name?: string | null
          id?: string
          revenue_split?: number | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string | null
          submitted_at?: string | null
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string | null
          content_level?: Database["public"]["Enums"]["content_level"]
          cover_image?: string | null
          game_id?: string | null
          game_name?: string | null
          id?: string
          revenue_split?: number | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string | null
          submitted_at?: string | null
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ugc_submissions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      user_memberships: {
        Row: {
          amount: number | null
          auto_renew: boolean | null
          billing_cycle: string | null
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["membership_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["membership_tier"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_info: string
          admin_id: string | null
          admin_note: string | null
          amount: number
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["payout_method"]
          processed_at: string | null
          real_name: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_info: string
          admin_id?: string | null
          admin_note?: string | null
          amount: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          processed_at?: string | null
          real_name?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_info?: string
          admin_id?: string | null
          admin_note?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payout_method"]
          processed_at?: string | null
          real_name?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      site_stats: {
        Row: {
          hot_games: number | null
          last_game_update: string | null
          last_leak_update: string | null
          paid_members: number | null
          published_leaks: number | null
          released_games: number | null
          total_games: number | null
          total_members: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_referral_reward: {
        Args: { p_invited_user_id: string }
        Returns: string
      }
      calculate_revenue: {
        Args: never
        Returns: {
          records_created: number
          status: string
          total_amount: number
        }[]
      }
      grant_submission_reward: {
        Args: { p_submission_id: string; p_type: string; p_user_id: string }
        Returns: Json
      }
      hot_leak_bonus: { Args: { p_content_id: string }; Returns: Json }
      increment_view: {
        Args: { article_id?: string; leak_id?: string }
        Returns: undefined
      }
      run_daily_update: {
        Args: never
        Returns: {
          result: Json
        }[]
      }
      signup_user: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
      try_claim_promotion: {
        Args: {
          p_device_fingerprint?: string
          p_ip_address?: string
          p_user_id: string
        }
        Returns: Json
      }
      verify_password: {
        Args: { p_email: string; p_password: string }
        Returns: Json
      }
    }
    Enums: {
      content_level: "free" | "gold" | "diamond"
      membership_tier: "free" | "silver" | "gold" | "diamond"
      payout_method: "alipay" | "wechat"
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
      content_level: ["free", "gold", "diamond"],
      membership_tier: ["free", "silver", "gold", "diamond"],
      payout_method: ["alipay", "wechat"],
    },
  },
} as const
