import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  role: z.enum(['user', 'business_owner', 'admin']),
})

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const admin = await requireAdmin(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Admin huquqi talab etiladi' }, { status: 403 })
  }

  // O'z-o'zini adminlikdan tushirishni taqiqlash (ixtiyoriy, xavfsizlik uchun)
  if (params.id === admin.id) {
    return NextResponse.json({ error: 'O\'z huquqingizni o\'zgartira olmaysiz' }, { status: 400 })
  }

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Noto\'g\'ri JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Noto\'g\'ri so\'rov' }, { status: 400 })

  const { role } = parsed.data

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', params.id)

  if (error) {
    console.error('Update user role error:', error)
    return NextResponse.json({ error: 'Yangilashda xato yuz berdi' }, { status: 500 })
  }

  return NextResponse.json({ success: true, role })
}
