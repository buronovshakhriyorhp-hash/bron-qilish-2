import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Sora, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/ui/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import Link from 'next/link'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BronUz — O\'zbekistonda Bron Qilish',
    template: '%s | BronUz',
  },
  description: 'Restoran, shifokor, sartaroshxona, beauty salon va boshqa xizmatlarni onlayn bron qiling. Telefonda gaplashmasdan, qulay va tez.',
  keywords: ['bron', 'bronlash', 'uzbekistan', 'restoran', 'shifokor', 'sartarosh', 'beauty salon'],
  authors: [{ name: 'BronUz' }],
  openGraph: {
    title: 'BronUz — O\'zbekistonda Bron Qilish',
    description: 'Barcha xizmatlarni bitta joyda bron qiling',
    locale: 'uz_UZ',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4F46E5',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className={`${sora.variable} ${dmSans.variable}`}>
      <body className={`${dmSans.className} antialiased bg-[#F3F4F8]`}>
        <AuthProvider>
          <div className="max-w-[1440px] mx-auto bg-white min-h-screen shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col relative">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>

          {/* ── FOOTER ── */}
          <footer style={{ background: '#0F0F1A' }} className="text-white pt-[60px] pb-[32px] px-[80px] max-lg:px-[40px] max-md:px-[20px] w-full">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-[48px] mb-[48px]">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-[10px] mb-[16px]">
                    <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-white text-[18px] font-black font-heading" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                      ⚡
                    </div>
                    <span className="font-heading font-bold text-[18px] text-white">SuperApp</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Toshkentdagi barcha xizmatlarni bitta platformada birlashtirgan bron tizimi. Vaqtingizni biz bilan tejang.
                  </p>
                  <div className="flex gap-2 mt-5">
                    {['T', 'in', 'ig', 'yt'].map(s => (
                      <div
                        key={s}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Xizmatlar */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Xizmatlar</h5>
                  <ul className="space-y-2.5">
                    {[
                      { href: '/categories/restoran',   label: 'Restoranlar' },
                      { href: '/categories/shifokor',   label: 'Shifokorlar' },
                      { href: '/categories/sartarosh',  label: 'Sartaroshxona' },
                      { href: '/categories/beauty',     label: 'Beauty Salon' },
                      { href: '/categories/sport',      label: 'Sport Zal' },
                    ].map(l => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Kompaniya */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Kompaniya</h5>
                  <ul className="space-y-2.5">
                    {[
                      { href: '/business/register', label: 'Biznes qo\'shish' },
                      { href: '/dashboard',         label: 'Biznes panel' },
                      { href: '/nearby',            label: 'Yaqin joylarda' },
                    ].map(l => (
                      <li key={l.href}>
                        <Link href={l.href} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aloqa */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Aloqa</h5>
                  <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <li>📱 +998 71 XXX-XX-XX</li>
                    <li>✉️ info@bronuz.uz</li>
                    <li>📍 Toshkent, O'zbekiston</li>
                  </ul>
                </div>
              </div>

              {/* Bottom */}
              <div className="border-t pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}>
                <span>© 2026 BronUz. Barcha huquqlar himoyalangan.</span>
                <div className="flex gap-5">
                  <Link href="#" className="hover:text-white transition-colors">Maxfiylik</Link>
                  <Link href="#" className="hover:text-white transition-colors">Shartlar</Link>
                  <Link href="#" className="hover:text-white transition-colors">Hamkorlik</Link>
                </div>
              </div>
            </div>
            </footer>
          </div>

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-dm, DM Sans)',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 16px rgba(79,70,229,.12)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
