import { createClient } from '@/lib/supabase/client'
import type { Business, Category, Booking, BookingFormData, Service } from '@/types'

// ============================================================
// KATEGORIYALAR
// ============================================================

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

// ============================================================
// BIZNESLAR
// ============================================================

export async function getFeaturedBusinesses(limit = 6): Promise<Business[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon, color)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getFeaturedBusinesses error:', error)
    return []
  }
  return data || []
}

export async function getBusinessesByCategory(
  categorySlug: string,
  filters?: { district?: string; minRating?: number }
): Promise<Business[]> {
  const supabase = createClient()

  let query = supabase
    .from('businesses')
    .select('*, category:categories!inner(id, name_uz, slug, icon, color)')
    .eq('is_active', true)
    .eq('categories.slug', categorySlug)
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false })

  if (filters?.district) {
    query = query.eq('district', filters.district)
  }
  if (filters?.minRating) {
    query = query.gte('rating', filters.minRating)
  }

  const { data, error } = await query
  if (error) {
    console.error('getBusinessesByCategory error:', error)
    return []
  }
  return data || []
}

export async function getBusinessById(id: string): Promise<Business | null> {
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
    console.error('getBusinessById error:', error)
    return null
  }
  return data
}

export async function searchBusinesses(query: string, district?: string): Promise<Business[]> {
  const supabase = createClient()

  let q = supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon, color)')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
    .order('rating', { ascending: false })
    .limit(20)

  if (district) {
    q = q.eq('district', district)
  }

  const { data, error } = await q
  if (error) {
    console.error('searchBusinesses error:', error)
    return []
  }
  return data || []
}

// ============================================================
// BRONLAR
// ============================================================

export async function createBooking(formData: BookingFormData): Promise<{ id: string } | null> {
  const supabase = createClient()

  // Joriy foydalanuvchini olish
  const { data: { user } } = await supabase.auth.getUser()

  // Xizmat davomiyligini olish (end_time hisoblash uchun)
  let durationMinutes = 60
  if (formData.serviceId) {
    const { data: service } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', formData.serviceId)
      .single()
    if (service) durationMinutes = service.duration_minutes
  }

  // End time hisoblash
  const [hours, minutes] = formData.time.split(':').map(Number)
  const endDate = new Date(2000, 0, 1, hours, minutes + durationMinutes)
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user?.id || null,
      business_id: formData.businessId,
      service_id: formData.serviceId || null,
      staff_id: formData.staffId || null,
      booking_date: formData.date,
      start_time: formData.time,
      end_time: endTime,
      customer_name: formData.customerName,
      customer_phone: formData.customerPhone,
      customer_note: formData.customerNote || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('createBooking error:', error)
    return null
  }

  // Bron sonini oshirish
  await supabase.rpc('increment_booking_count', { business_id: formData.businessId })
    .then(() => {}) // Xatolik bo'lsa ham davom etamiz

  return data
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      business:businesses(id, name, cover_image, phone),
      service:services(id, name, duration_minutes),
      staff:staff(id, name)
    `)
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })

  if (error) {
    console.error('getUserBookings error:', error)
    return []
  }
  return data || []
}

export async function cancelBooking(bookingId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_by: 'user',
      cancel_reason: 'Foydalanuvchi tomonidan bekor qilindi',
    })
    .eq('id', bookingId)
    .eq('user_id', userId) // Xavfsizlik: faqat o'z bronini bekor qila oladi

  if (error) {
    console.error('cancelBooking error:', error)
    return false
  }
  return true
}

// ============================================================
// BO'SH VAQTLAR (band vaqtlarni qidiruv)
// ============================================================

export async function getBookedSlots(
  businessId: string,
  date: string,
  staffId?: string
): Promise<string[]> {
  const supabase = createClient()

  let query = supabase
    .from('bookings')
    .select('start_time')
    .eq('business_id', businessId)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed'])

  if (staffId) {
    query = query.eq('staff_id', staffId)
  }

  const { data, error } = await query
  if (error) {
    console.error('getBookedSlots error:', error)
    return []
  }

  return (data || []).map(b => b.start_time.slice(0, 5)) // "HH:MM" formatda
}

// ============================================================
// DASHBOARD — BIZNES EGASI
// ============================================================

export async function getOwnerBusinesses(ownerId: string): Promise<Business[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon, color)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getOwnerBusinesses error:', error)
    return []
  }
  return data || []
}

export async function getBusinessBookings(businessId: string, limit = 50): Promise<Booking[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(id, name, duration_minutes),
      staff:staff(id, name)
    `)
    .eq('business_id', businessId)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getBusinessBookings error:', error)
    return []
  }
  return data || []
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show',
  cancelReason?: string
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('bookings')
    .update({
      status,
      cancelled_by: status === 'cancelled' ? 'business' : undefined,
      cancel_reason: cancelReason || undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (error) {
    console.error('updateBookingStatus error:', error)
    return false
  }
  return true
}

export interface CreateBusinessData {
  name: string
  categoryId: string
  description: string
  shortDescription?: string
  address: string
  district: string
  city: string
  phone: string
  phone2?: string
  instagram?: string
  telegram?: string
  coverImage?: string
  hours: { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string }[]
}

export async function createBusiness(data: CreateBusinessData, ownerId: string): Promise<string | null> {
  const supabase = createClient()

  // Slug yaratish
  const slug = data.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '-' + Date.now()

  const { data: biz, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: ownerId,
      category_id: data.categoryId,
      name: data.name,
      slug,
      description: data.description,
      short_description: data.shortDescription || '',
      address: data.address,
      district: data.district,
      city: data.city,
      phone: data.phone,
      phone2: data.phone2 || null,
      instagram: data.instagram || null,
      telegram: data.telegram || null,
      cover_image: data.coverImage || null,
      is_active: false,   // Admin tasdiqlagunga qadar yashirin
      is_verified: false,
      is_featured: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('createBusiness error:', error)
    return null
  }

  // Ish soatlarini saqlash
  if (data.hours.length > 0 && biz) {
    await supabase.from('business_hours').insert(
      data.hours.map(h => ({
        business_id: biz.id,
        day_of_week: h.dayOfWeek,
        is_open: h.isOpen,
        open_time: h.openTime,
        close_time: h.closeTime,
      }))
    )
  }

  // Foydalanuvchi rolini business_owner ga o'zgartirish
  await supabase
    .from('profiles')
    .update({ role: 'business_owner' })
    .eq('id', ownerId)

  return biz?.id || null
}

export async function getBusinessServices(businessId: string): Promise<Service[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('sort_order')

  if (error) {
    console.error('getBusinessServices error:', error)
    return []
  }
  return data || []
}

export async function upsertService(
  service: Partial<Service> & { business_id: string; name: string }
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('services')
    .upsert({ ...service })

  if (error) {
    console.error('upsertService error:', error)
    return false
  }
  return true
}

export async function deleteService(serviceId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)

  if (error) {
    console.error('deleteService error:', error)
    return false
  }
  return true
}
