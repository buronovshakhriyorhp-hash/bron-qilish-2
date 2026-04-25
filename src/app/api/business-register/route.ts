import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(50),
  phone: z.string().regex(/^\+998\d{9}$/, 'Format: +998XXXXXXXXX'),
  address: z.string().min(5).max(200),
  description: z.string().max(1000).optional().default(''),
  instagram: z.string().max(50).optional(),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!rateLimit(`biz-register:${ip}`, 3, 3_600_000)) {
    return NextResponse.json({ error: 'Juda ko\'p urinish. 1 soatdan keyin urinib ko\'ring.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Noto\'g\'ri JSON' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validatsiya xatosi', details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, category, phone, address, description, instagram } = parsed.data

  const supabase = createClient()

  // Kategoriyani topish (slug orqali)
  const { data: cat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', category)
    .single()

  const slug =
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
    '-' +
    Date.now()

  const { data: biz, error } = await supabase
    .from('businesses')
    .insert({
      name,
      slug,
      category_id: cat?.id ?? null,
      phone,
      address,
      city: 'Toshkent',
      description,
      instagram: instagram ?? null,
      is_active: false,   // Admin tasdiqlagunga qadar yashirin
      is_verified: false,
      is_featured: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('business-register error:', error)
    return NextResponse.json({ error: 'Saqlashda xato yuz berdi' }, { status: 500 })
  }

  return NextResponse.json({ id: biz.id, message: 'Ariza qabul qilindi' }, { status: 201 })
}
