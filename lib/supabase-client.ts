import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ToolCategory = {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string
  color: string
  enabled: boolean
  order: number
  created_at: string
  updated_at: string
}

export type Tool = {
  id: string
  category_id: string
  slug: string
  title: string
  description: string | null
  icon: string
  enabled: boolean
  is_new: boolean
  is_premium: boolean
  supports_bulk: boolean
  input_types: string[]
  output_types: string[]
  order: number
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[]
  usage_count: number
  created_at: string
  updated_at: string
}

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  featured_image: string | null
  author: string
  category: string
  tags: string[]
  published: boolean
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}
