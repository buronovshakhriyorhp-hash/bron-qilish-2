'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard, CalendarDays, Scissors,
  PlusCircle, ArrowLeft, LogOut, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const NAV_ITEMS = [
  { href: '/dashboard',              label: 'Umumiy ko\'rinish', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings',     label: 'Bronlar',           icon: CalendarDays },
  { href: '/dashboard/services',     label: 'Xizmatlar',         icon: Scissors },
  { href: '/dashboard/business/new', label: 'Biznes qo\'shish',  icon: PlusCircle },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/dashboard')
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg animate-pulse">B</div>
          <p className="text-sm text-slate-400">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const phone = user.phone?.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3') || 'Profil'
  const initial = user.phone ? user.phone.replace('+998', '')[0] : '?'

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20 shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-slate-50">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">B</div>
            <div>
              <span className="font-black text-slate-800 text-lg">BronUz</span>
              <p className="text-xs text-slate-400 -mt-0.5 font-medium">Biznes paneli</p>
            </div>
          </Link>
        </div>

        {/* User info */}
        <div className="mx-3 mt-3 p-3 bg-blue-50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">Biznes egasi</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{phone}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 mt-2 space-y-0.5">
          <p className="text-xs font-semibold text-slate-400 px-3 mb-2 uppercase tracking-wider">Menyu</p>
          {NAV_ITEMS.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-100 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={17} /> Saytga qaytish
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={17} /> Chiqish
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-slate-100 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {NAV_ITEMS.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label || 'Dashboard'}
            </div>
            <Link
              href="/dashboard/business/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
            >
              <PlusCircle size={15} /> Biznes qo'shish
            </Link>
          </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
