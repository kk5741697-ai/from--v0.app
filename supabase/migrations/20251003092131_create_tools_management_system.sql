/*
  # Tools Management System

  1. New Tables
    - `tool_categories`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `name` (text) - Display name
      - `description` (text) - Category description
      - `icon` (text) - Icon name
      - `color` (text) - Theme color
      - `enabled` (boolean) - Enable/disable category
      - `order` (integer) - Sort order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tools`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `slug` (text, unique) - URL-friendly identifier
      - `title` (text) - Tool display name
      - `description` (text) - Tool description
      - `icon` (text) - Icon name
      - `enabled` (boolean) - Enable/disable tool
      - `is_new` (boolean) - Show "New" badge
      - `is_premium` (boolean) - Premium tool flag
      - `supports_bulk` (boolean) - Supports bulk processing
      - `input_types` (jsonb) - Array of accepted input types
      - `output_types` (jsonb) - Array of output types
      - `order` (integer) - Sort order within category
      - `meta_title` (text) - SEO title
      - `meta_description` (text) - SEO description
      - `meta_keywords` (jsonb) - SEO keywords array
      - `usage_count` (bigint) - Track usage statistics
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `blog_posts`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `featured_image` (text)
      - `author` (text)
      - `category` (text)
      - `tags` (jsonb) - Array of tags
      - `published` (boolean)
      - `published_at` (timestamptz)
      - `meta_title` (text)
      - `meta_description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tool_usage_stats`
      - `id` (uuid, primary key)
      - `tool_id` (uuid, foreign key)
      - `date` (date)
      - `usage_count` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for published content
    - Authenticated write access for admin operations
*/

-- Create tool_categories table
CREATE TABLE IF NOT EXISTS tool_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'Folder',
  color text DEFAULT '#3b82f6',
  enabled boolean DEFAULT true,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES tool_categories(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'Tool',
  enabled boolean DEFAULT true,
  is_new boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  supports_bulk boolean DEFAULT false,
  input_types jsonb DEFAULT '[]'::jsonb,
  output_types jsonb DEFAULT '[]'::jsonb,
  "order" integer DEFAULT 0,
  meta_title text,
  meta_description text,
  meta_keywords jsonb DEFAULT '[]'::jsonb,
  usage_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  author text DEFAULT 'PixoraTools Team',
  category text DEFAULT 'General',
  tags jsonb DEFAULT '[]'::jsonb,
  published boolean DEFAULT false,
  published_at timestamptz,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tool_usage_stats table
CREATE TABLE IF NOT EXISTS tool_usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id uuid REFERENCES tools(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  usage_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tool_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_enabled ON tools(enabled);
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tool_categories_enabled ON tool_categories(enabled);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_tool_usage_stats_tool_date ON tool_usage_stats(tool_id, date);

-- Enable RLS
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for enabled content
CREATE POLICY "Public can view enabled categories"
  ON tool_categories FOR SELECT
  TO public
  USING (enabled = true);

CREATE POLICY "Public can view enabled tools"
  ON tools FOR SELECT
  TO public
  USING (enabled = true);

CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Public can view usage stats"
  ON tool_usage_stats FOR SELECT
  TO public
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tool_categories_updated_at
  BEFORE UPDATE ON tool_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();