import { NextRequest, NextResponse } from 'next/server'
import { bookingSchema } from '@/lib/validations'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { sendSms, bookingCreatedMessage } from '@/lib/sms'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  if (!rateLimit(`booking:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Juda ko\'p bron. 1 daqiqadan keyin urinib ko\'ring.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Noto\'g\'ri JSON' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validatsiya xatosi', details: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const formData = parsed.data

  // Xizmat davomiyligini olish
  let durationMinutes = 60
  if (formData.serviceId) {
    const { data: svc } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('id', formData.serviceId)
      .single()
    if (svc) durationMinutes = svc.duration_minutes
  }

  const [h, m] = formData.time.split(':').map(Number)
  const endDate = new Date(2000, 0, 1, h, m + durationMinutes)
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user?.id ?? null,
      business_id: formData.businessId,
      service_id: formData.serviceId ?? null,
      staff_id: formData.staffId ?? null,
      booking_date: formData.date,
      start_time: formData.time,
      end_time: endTime,
      customer_name: formData.customerName,
      customer_phone: formData.customerPhone,
      customer_note: formData.customerNote ?? null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    console.error('booking create error:', error)
    return NextResponse.json({ error: 'Bron yaratishda xato' }, { status: 500 })
  }

  // Biznes nomini olish (SMS uchun)
  const { data: biz } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', formData.businessId)
    .single()

  // SMS yuborish (xato bo'lsa ham bron saqlanadi)
  if (biz?.name) {
    sendSms(
      formData.customerPhone,
      bookingCreatedMessage(biz.name, formData.date, formData.time),
    ).catch(() => {}) // Background, await qilmaymiz
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
