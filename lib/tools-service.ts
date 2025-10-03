import { supabase, type Tool, type ToolCategory } from './supabase-client'

export class ToolsService {
  /**
   * Get all enabled tool categories
   */
  static async getCategories(): Promise<ToolCategory[]> {
    const { data, error } = await supabase
      .from('tool_categories')
      .select('*')
      .eq('enabled', true)
      .order('order', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  }

  /**
   * Get tools by category slug
   */
  static async getToolsByCategory(categorySlug: string): Promise<Tool[]> {
    // First get the category
    const { data: category } = await supabase
      .from('tool_categories')
      .select('id')
      .eq('slug', categorySlug)
      .eq('enabled', true)
      .maybeSingle()

    if (!category) return []

    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('category_id', category.id)
      .eq('enabled', true)
      .order('order', { ascending: true })

    if (error) {
      console.error('Error fetching tools:', error)
      return []
    }

    return data || []
  }

  /**
   * Get all enabled tools
   */
  static async getAllTools(): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('enabled', true)
      .order('order', { ascending: true })

    if (error) {
      console.error('Error fetching tools:', error)
      return []
    }

    return data || []
  }

  /**
   * Get tool by slug
   */
  static async getToolBySlug(slug: string): Promise<Tool | null> {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .eq('enabled', true)
      .maybeSingle()

    if (error) {
      console.error('Error fetching tool:', error)
      return null
    }

    return data
  }

  /**
   * Search tools by query
   */
  static async searchTools(query: string): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('enabled', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error searching tools:', error)
      return []
    }

    return data || []
  }

  /**
   * Increment tool usage count
   */
  static async incrementUsage(toolSlug: string): Promise<void> {
    try {
      // Get tool
      const { data: tool } = await supabase
        .from('tools')
        .select('id')
        .eq('slug', toolSlug)
        .eq('enabled', true)
        .maybeSingle()

      if (!tool) return

      // Increment usage count
      await supabase
        .from('tools')
        .update({ usage_count: supabase.rpc('increment') })
        .eq('id', tool.id)

      // Track daily usage
      await supabase
        .from('tool_usage_stats')
        .insert({
          tool_id: tool.id,
          date: new Date().toISOString().split('T')[0],
          usage_count: 1
        })
        .onConflict('tool_id,date')
    } catch (error) {
      console.error('Error tracking usage:', error)
    }
  }

  /**
   * Get popular tools
   */
  static async getPopularTools(limit: number = 10): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('enabled', true)
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular tools:', error)
      return []
    }

    return data || []
  }

  /**
   * Get new tools
   */
  static async getNewTools(limit: number = 6): Promise<Tool[]> {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('enabled', true)
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching new tools:', error)
      return []
    }

    return data || []
  }
}
