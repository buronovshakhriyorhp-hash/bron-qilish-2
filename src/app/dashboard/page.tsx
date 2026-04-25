'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Building2, CalendarDays, Clock, CheckCircle,
  PlusCircle, TrendingUp, ArrowRight, Users,
  BarChart3, Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getOwnerBusinesses, getBusinessBookings } from '@/lib/db/queries'
import type { Business, Booking } from '@/types'

const UZ_MONTHS = ['Yan','Fev','Mar','Apr','May','Iyu','Iyu','Avg','Sen','Okt','Noy','Dek']
function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${UZ_MONTHS[m-1]}`
}

const STATUS = {
  pending:   { label: 'Kutilmoqda', color: 'badge-amber' },
  confirmed: { label: 'Tasdiqlangan', color: 'badge-green' },
  cancelled: { label: 'Bekor', color: 'badge-red' },
  completed: { label: 'Yakunlangan', color: 'badge-blue' },
  no_show:   { label: 'Kelmadi', color: 'badge-slate' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const bizList = await getOwnerBusinesses(user!.id)
      setBusinesses(bizList)
      if (bizList.length > 0) {
        const all: Booking[] = []
        for (const biz of bizList) {
          const b = await getBusinessBookings(biz.id, 30)
          all.push(...b)
        }
        all.sort((a, b) => b.booking_date.localeCompare(a.booking_date))
        setBookings(all)
      }
      setLoading(false)
    }
    load()
  }, [user])

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.booking_date === todayStr)
  const recentBookings = bookings.slice(0, 8)

  if (loading) {
    return (
      <div className="max-w-5xl space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Xush kelibsiz!</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-3xl p-14 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-blue-500/25">
            🏢
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Biznesingizni qo'shing</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Birinchi biznesingizni platformaga qo'shing va mijozlardan bron qabul qila boshlang
          </p>
          <Link
            href="/dashboard/business/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-blue-500/30 text-lg"
          >
            <PlusCircle size={20} /> Biznes qo'shish
          </Link>
          <div className="flex justify-center gap-6 mt-8 text-sm text-slate-400">
            {['✅ Bepul', '✅ Tez sozlash', '✅ SMS bildirishnoma'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        {todayBookings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-sm text-amber-700 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Bugun {todayBookings.length} ta bron
          </div>
        )}
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Jami bronlar',    value: stats.total,     icon: CalendarDays, gradient: 'from-blue-500 to-blue-600',    bg: 'bg-blue-50',   text: 'text-blue-600' },
          { label: 'Kutilmoqda',      value: stats.pending,   icon: Clock,        gradient: 'from-amber-400 to-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-600' },
          { label: 'Tasdiqlangan',    value: stats.confirmed, icon: CheckCircle,  gradient: 'from-green-500 to-green-600',  bg: 'bg-green-50',  text: 'text-green-600' },
          { label: 'Yakunlangan',     value: stats.completed, icon: TrendingUp,   gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
        ].map((s, i) => (
          <div key={s.label} className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-fade-up`} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={`w-11 h-11 ${s.bg} ${s.text} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={20} />
            </div>
            <div className="text-3xl font-black text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Bizneslar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Bizneslarim</h2>
            <Link href="/dashboard/business/new" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <PlusCircle size={13} /> Qo'shish
            </Link>
          </div>
          {businesses.map(biz => (
            <div key={biz.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {biz.cover_image ? (
                  <img src={biz.cover_image} alt={biz.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl shrink-0">🏢</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{biz.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{biz.address || biz.city}</p>
                  <div className="flex gap-1.5 mt-2">
                    {biz.is_verified
                      ? <span className="badge badge-green text-xs">✓ Tasdiqlangan</span>
                      : <span className="badge badge-amber text-xs">⏳ Kutilmoqda</span>
                    }
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link href="/dashboard/bookings" className="text-center py-2 text-xs font-semibold bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors">
                  📅 Bronlar
                </Link>
                <Link href="/dashboard/services" className="text-center py-2 text-xs font-semibold bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
                  ✂️ Xizmatlar
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* So'nggi bronlar */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800">So'nggi bronlar</h2>
            <Link href="/dashboard/bookings" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Barchasi <ArrowRight size={12} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-400 text-sm">Hali bronlar yo'q</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-4 px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <div>Mijoz</div>
                <div>Xizmat</div>
                <div>Sana</div>
                <div>Holat</div>
              </div>
              {/* Table rows */}
              {recentBookings.map((b, i) => {
                const st = STATUS[b.status as keyof typeof STATUS] || STATUS.pending
                return (
                  <div
                    key={b.id}
                    className={`grid grid-cols-4 px-4 py-3.5 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors animate-fade-up`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 truncate">{b.customer_name || '—'}</p>
                      <p className="text-xs text-slate-400">{b.customer_phone?.replace('+998', '')}</p>
                    </div>
                    <div className="text-xs text-slate-600 truncate pr-2">
                      {(b.service as any)?.name || '—'}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-medium">{formatDate(b.booking_date)}</span>
                      <span className="text-slate-400 ml-1">{b.start_time?.slice(0,5)}</span>
                    </div>
                    <div>
                      <span className={`badge ${st.color} text-xs`}>{st.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/bookings', icon: CalendarDays, label: 'Bronlarni boshqarish', desc: 'Tasdiqlash va bekor qilish', color: 'from-blue-500 to-blue-600' },
          { href: '/dashboard/services', icon: Zap,          label: 'Xizmatlar',           desc: 'Narx va davomiylik',       color: 'from-violet-500 to-violet-600' },
          { href: '/dashboard/business/new', icon: PlusCircle, label: 'Yangi biznes',       desc: 'Yana bir biznes qo\'shing', color: 'from-green-500 to-green-600' },
        ].map((action, i) => (
          <Link
            key={action.href}
            href={action.href}
            className="group bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all animate-fade-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-0.5">{action.label}</h3>
            <p className="text-xs text-slate-400">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
