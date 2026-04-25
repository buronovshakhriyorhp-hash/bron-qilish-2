import { NextRequest, NextResponse } from 'next/server'
import { getBusinessByIdServer } from '@/lib/db/server-queries'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(request)
  if (!rateLimit(`biz:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Juda ko\'p so\'rov.' }, { status: 429 })
  }

  const business = await getBusinessByIdServer(params.id)
  if (!business) {
    return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
  }

  return NextResponse.json(business, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
