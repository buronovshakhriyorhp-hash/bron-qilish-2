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
  if (!admin) return NextResponse.json({ error: 'Admin huquqi talab etiladi' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const filter = searchParams.get('filter') ?? 'all' // all | pending | active

  let q = supabase
    .from('businesses')
    .select('*, category:categories(id, name_uz, slug, icon)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (filter === 'pending') q = q.eq('is_verified', false)
  if (filter === 'active') q = q.eq('is_active', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: 'Xato' }, { status: 500 })
  return NextResponse.json({ businesses: data || [] })
}
