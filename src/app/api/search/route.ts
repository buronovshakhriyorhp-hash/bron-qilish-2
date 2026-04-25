import { NextRequest, NextResponse } from 'next/server'
import { searchBusinessesServer } from '@/lib/db/server-queries'
import { searchSchema } from '@/lib/validations'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  if (!rateLimit(`search:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Juda ko\'p so\'rov. 1 daqiqadan keyin urinib ko\'ring.' }, { status: 429 })
  }

  const params = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = searchSchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Noto\'g\'ri parametrlar', details: parsed.error.flatten() }, { status: 400 })
  }

  const { q, district, category, minRating, sortBy, page, userLat, userLng } = parsed.data
  const result = await searchBusinessesServer(q, { district, categorySlug: category, minRating, sortBy, page, userLat, userLng })

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  })
}
