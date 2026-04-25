import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const admin = await requireAdmin(supabase)
  
  if (!admin) {
    return NextResponse.json({ error: 'Admin huquqi talab etiladi' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') || 'all'

  let query = supabase
    .from('bookings')
    .select('*, business:businesses(name, phone), user:profiles(full_name, phone)')
    .order('created_at', { ascending: false })

  if (filter === 'pending') {
    query = query.eq('status', 'pending')
  } else if (filter === 'confirmed') {
    query = query.eq('status', 'confirmed')
  } else if (filter === 'cancelled') {
    query = query.in('status', ['cancelled', 'no_show'])
  }

  const { data, error } = await query

  if (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json({ error: 'Ma\'lumotlarni olishda xato yuz berdi' }, { status: 500 })
  }

  return NextResponse.json({ bookings: data || [] })
}
