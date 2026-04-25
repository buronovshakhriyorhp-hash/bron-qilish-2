import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Quyidagi yo'llardan boshqasiga middleware qo'llanadi:
     * - _next/static (static fayllar)
     * - _next/image (rasm optimizatsiyasi)
     * - favicon.ico
     * - public papkadagi fayllar
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
