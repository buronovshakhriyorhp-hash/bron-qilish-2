import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendSms, bookingConfirmedMessage } from '@/lib/sms'

const actionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()

  // Admin tekshirish
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Autentifikatsiya talab etiladi' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin huquqi talab etiladi' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Noto\'g\'ri JSON' }, { status: 400 })
  }

  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Noto\'g\'ri so\'rov' }, { status: 400 })
  }

  const { action } = parsed.data
  const updates =
    action === 'approve'
      ? { is_verified: true, is_active: true }
      : { is_verified: false, is_active: false }

  const { error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Yangilashda xato' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
