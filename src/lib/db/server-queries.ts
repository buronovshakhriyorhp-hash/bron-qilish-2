import { createClient } from '@/lib/supabase/server'
import type { Business, Category, Booking } from '@/types'

const ITEMS_PER_PAGE = 12

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('getCategories error:', error)
    return []
  }
  return data || []
}

export async function getBusinessesByCategory(
  categorySlug: string,
  options: {
    district?: string
    minRating?: number
    sortBy?: 'rating' | 'reviews' | 'newest'
    page?: number
  } = {}
): Promise<{ businesses: Business[]; total: number }> {
  const supabase = createClient()
  const { district, minRating, sortBy = 'rating', page = 1 } = options
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let query = supabase
    .from('businesses')
    .select('*, category:categories!inner(id, name_uz, slug, icon, color)', { count: 'exact' })
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)

  if (district) query = query.eq('district', district)
  if (minRating) query = query.gte('rating', minRating)

  if (sortBy === 'rating') {
    query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false })
  } else if (sortBy === 'reviews') {
    query = query.order('review_count', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('getBusinessesByCategory error:', error)
    return { businesses: [], total: 0 }
  }
  return { businesses: data || [], total: count || 0 }
}

export async function getBusinessByIdServer(id: string): Promise<Business | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      category:categories(id, name_uz, slug, icon, color),
      services(id, name, description, duration_minutes, price_min, price_max, price_label, is_active, sort_order),
      hours:business_hours(id, day_of_week, is_open, open_time, close_time),
      staff(id, name, specialization, avatar, experience_years, is_active)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('getBusinessByIdServer error:', error)
    return null
  }
  return data
}

export async function searchBusinessesServer(
  query: string,
  options: {
    district?: string
    categorySlug?: string
    minRating?: number
    sortBy?: 'rating' | 'reviews'
    page?: number
  } = {}
): Promise<{ businesses: Business[]; total: number }> {
  const supabase = createClient()
  const { district, categorySlug, minRating, sortBy = 'rating', page = 1 } = options
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let q = supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon, color)', { count: 'exact' })
    .eq('is_active', true)

  if (query.trim()) {
    q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
  }
  if (district) q = q.eq('district', district)
  if (minRating) q = q.gte('rating', minRating)
  if (categorySlug) {
    q = q.eq('categories.slug', categorySlug)
  }

  if (sortBy === 'rating') {
    q = q.order('rating', { ascending: false })
  } else {
    q = q.order('review_count', { ascending: false })
  }

  const { data, error, count } = await q.range(from, to)

  if (error) {
    console.error('searchBusinessesServer error:', error)
    return { businesses: [], total: 0 }
  }
  return { businesses: data || [], total: count || 0 }
}

export async function getNearbyBusinesses(options: {
  lat?: number
  lng?: number
  category?: string
  page?: number
} = {}): Promise<{ businesses: Business[]; total: number }> {
  const supabase = createClient()
  const { category, page = 1 } = options
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  let q = supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon, color)', { count: 'exact' })
    .eq('is_active', true)

  if (category && category !== 'all') {
    q = q.eq('categories.slug', category)
  }

  q = q.order('rating', { ascending: false })

  const { data, error, count } = await q.range(from, to)

  if (error) {
    console.error('getNearbyBusinesses error:', error)
    return { businesses: [], total: 0 }
  }
  return { businesses: data || [], total: count || 0 }
}

export async function getPendingBusinesses(): Promise<Business[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon, color)')
    .eq('is_verified', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getPendingBusinesses error:', error)
    return []
  }
  return data || []
}

export async function getAllBusinesses(page = 1): Promise<{ businesses: Business[]; total: number }> {
  const supabase = createClient()
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  const { data, error, count } = await supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon, color)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getAllBusinesses error:', error)
    return { businesses: [], total: 0 }
  }
  return { businesses: data || [], total: count || 0 }
}

export async function getAdminStats(): Promise<{
  totalBusinesses: number
  pendingBusinesses: number
  totalBookings: number
  totalUsers: number
}> {
  const supabase = createClient()

  const [bizRes, pendingRes, bookRes, usersRes] = await Promise.all([
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalBusinesses: bizRes.count || 0,
    pendingBusinesses: pendingRes.count || 0,
    totalBookings: bookRes.count || 0,
    totalUsers: usersRes.count || 0,
  }
}

export async function getRecentBookings(limit = 20): Promise<Booking[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      business:businesses(id, name),
      service:services(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRecentBookings error:', error)
    return []
  }
  return data || []
}

export { ITEMS_PER_PAGE }
