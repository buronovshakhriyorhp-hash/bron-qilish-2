// ============================================================
// BronUz — TypeScript Turlari
// ============================================================

export interface Category {
  id: string
  name_uz: string
  name_ru?: string
  slug: string
  icon?: string
  color: string
  is_active: boolean
  sort_order: number
}

export interface Profile {
  id: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: 'user' | 'business_owner' | 'admin'
  created_at: string
}

export interface Business {
  id: string
  owner_id?: string
  category_id?: string
  name: string
  slug: string
  description?: string
  short_description?: string
  address?: string
  district?: string
  city: string
  latitude?: number
  longitude?: number
  phone?: string
  phone2?: string
  website?: string
  instagram?: string
  telegram?: string
  cover_image?: string
  logo?: string
  images: string[]
  rating: number
  review_count: number
  booking_count: number
  is_active: boolean
  is_verified: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  // Join
  category?: Category
  hours?: BusinessHour[]
  services?: Service[]
}

export interface BusinessHour {
  id: string
  business_id: string
  day_of_week: number   // 0=Yakshanba, 1=Dushanba, ...
  is_open: boolean
  open_time: string
  close_time: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  description?: string
  duration_minutes: number
  price_min?: number
  price_max?: number
  price_label?: string
  is_active: boolean
  sort_order: number
}

export interface Staff {
  id: string
  business_id: string
  name: string
  specialization?: string
  avatar?: string
  experience_years?: number
  is_active: boolean
}

export interface Booking {
  id: string
  user_id?: string
  business_id: string
  service_id?: string
  staff_id?: string
  booking_date: string
  start_time: string
  end_time: string
  customer_name?: string
  customer_phone?: string
  customer_note?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  price?: number
  cancel_reason?: string
  cancelled_by?: 'user' | 'business'
  created_at: string
  // Join
  business?: Business
  service?: Service
  staff?: Staff
}

export interface Review {
  id: string
  booking_id?: string
  business_id: string
  user_id?: string
  rating: number
  comment?: string
  is_visible: boolean
  created_at: string
  // Join
  profile?: Profile
}

// Bron yaratish uchun form ma'lumotlari
export interface BookingFormData {
  businessId: string
  serviceId?: string
  staffId?: string
  date: string
  time: string
  customerName: string
  customerPhone: string
  customerNote?: string
}

// Qidiruv filtrlari
export interface SearchFilters {
  query?: string
  categorySlug?: string
  district?: string
  city?: string
  minRating?: number
  lat?: number
  lng?: number
  radiusKm?: number
}
