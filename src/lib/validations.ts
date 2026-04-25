import { z } from 'zod'

export const searchSchema = z.object({
  q: z.string().max(100).optional().default(''),
  district: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sortBy: z.enum(['rating', 'reviews', 'distance']).optional().default('rating'),
  page: z.coerce.number().min(1).max(100).optional().default(1),
  userLat: z.coerce.number().optional(),
  userLng: z.coerce.number().optional(),
})

export const businessRegisterSchema = z.object({
  name: z.string().min(2, "Biznes nomi kamida 2 harf bo'lishi kerak").max(100),
  categoryId: z.string().uuid("Kategoriya tanlanishi shart"),
  phone: z.string().regex(/^\+998\d{9}$/, "To'g'ri format: +998XXXXXXXXX"),
  address: z.string().min(5, "Manzil kamida 5 harf bo'lishi kerak").max(200),
  district: z.string().min(2).max(50),
  city: z.string().min(2).max(50).default("Toshkent"),
  description: z.string().max(1000).optional().default(''),
  instagram: z.string().max(50).optional(),
  telegram: z.string().max(50).optional(),
})

export const bookingSchema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  staffId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana formati: YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Vaqt formati: HH:MM"),
  customerName: z.string().min(2, "Ism kamida 2 harf").max(100),
  customerPhone: z.string().regex(/^\+998\d{9}$/, "To'g'ri format: +998XXXXXXXXX"),
  customerNote: z.string().max(500).optional(),
})

export type SearchInput = z.infer<typeof searchSchema>
export type BusinessRegisterInput = z.infer<typeof businessRegisterSchema>
export type BookingInput = z.infer<typeof bookingSchema>
