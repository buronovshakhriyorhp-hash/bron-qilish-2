import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { sendSms, bookingConfirmedMessage, bookingCancelledMessage } from '@/lib/sms'

const schema = z.object({
  action: z.enum(['confirm', 'cancel']),
  reason: z.string().max(300).optional(),
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
  if (!admin) return NextResponse.json({ error: 'Admin huquqi talab etiladi' }, { status: 403 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Noto\'g\'ri JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Noto\'g\'ri so\'rov' }, { status: 400 })

  const { action, reason } = parsed.data

  // Bronni olish
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, business:businesses(name)')
    .eq('id', params.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Bron topilmadi' }, { status: 404 })

  const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled'

  const { error } = await supabase
    .from('bookings')
    .update({
      status: newStatus,
      cancelled_by: action === 'cancel' ? 'business' : undefined,
      cancel_reason: reason ?? undefined,
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: 'Yangilashda xato' }, { status: 500 })

  // SMS yuborish
  const phone = booking.customer_phone
  const bizName = (booking.business as { name: string } | null)?.name ?? ''

  if (phone && bizName) {
    const msg = action === 'confirm'
      ? bookingConfirmedMessage(bizName, booking.booking_date, booking.start_time)
      : bookingCancelledMessage(bizName)
    sendSms(phone, msg).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
