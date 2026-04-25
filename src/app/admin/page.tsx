'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, CalendarDays, Users, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Business, Booking } from '@/types'

interface Stats {
  totalBusinesses: number
  pendingBusinesses: number
  totalBookings: number
  totalUsers: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pending, setPending] = useState<Business[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [bizRes, pendingRes, bookRes, usersRes, pendingBizRes, recentBooksRes] = await Promise.all([
      supabase.from('businesses').select('*', { count: 'exact', head: true }),
      supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', false),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('businesses')
        .select('*, category:categories(id, name_uz, slug, icon)')
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('bookings')
        .select('*, business:businesses(id, name)')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    setStats({
      totalBusinesses: bizRes.count ?? 0,
      pendingBusinesses: pendingRes.count ?? 0,
      totalBookings: bookRes.count ?? 0,
      totalUsers: usersRes.count ?? 0,
    })
    setPending(pendingBizRes.data || [])
    setRecentBookings(recentBooksRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleBusinessAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setPending(prev => prev.filter(b => b.id !== id))
        setStats(prev => prev
          ? { ...prev, pendingBusinesses: prev.pendingBusinesses - 1, totalBusinesses: action === 'approve' ? prev.totalBusinesses : prev.totalBusinesses - 1 }
          : prev
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleBookingAction = async (id: string, action: 'confirm' | 'cancel') => {
    setActionLoading(`booking-${id}`)
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      setRecentBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: action === 'confirm' ? 'confirmed' : 'cancelled' } : b
      ))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
        </div>
        <div className="h-64 bg-white rounded-2xl animate-pulse border border-slate-100" />
      </div>
    )
  }

  const statCards = [
    { label: 'Jami bizneslar', value: stats?.totalBusinesses ?? 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Kutilayotgan', value: stats?.pendingBusinesses ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Jami bronlar', value: stats?.totalBookings ?? 0, icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Foydalanuvchilar', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const BOOKING_STATUS: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'Kutilmoqda', cls: 'bg-amber-50 text-amber-700' },
    confirmed: { label: 'Tasdiqlangan', cls: 'bg-green-50 text-green-700' },
    cancelled: { label: 'Bekor', cls: 'bg-red-50 text-red-600' },
    completed: { label: 'Yakunlangan', cls: 'bg-blue-50 text-blue-700' },
    no_show:   { label: 'Kelmadi', cls: 'bg-slate-100 text-slate-500' },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">BronUz boshqaruv paneli</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={14} /> Yangilash
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              <s.icon size={18} />
            </div>
            <div className="text-3xl font-black text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending businesses */}
        <div>
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            Tasdiqlash kutilayotgan bizneslar ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">✅</div>
              Kutilayotgan biznes yo'q
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(biz => (
                <div key={biz.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{biz.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(biz.category as { name_uz?: string } | undefined)?.name_uz ?? '—'} · {biz.address ?? '—'} · {biz.phone ?? '—'}
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {new Date(biz.created_at).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleBusinessAction(biz.id, 'approve')}
                        disabled={actionLoading === biz.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <CheckCircle size={13} /> Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleBusinessAction(biz.id, 'reject')}
                        disabled={actionLoading === biz.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <XCircle size={13} /> Rad etish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div>
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarDays size={16} className="text-blue-500" />
            So'nggi bronlar
          </h2>

          {recentBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 text-sm">
              <div className="text-3xl mb-2">📭</div>
              Hali bronlar yo'q
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {recentBookings.map((b, i) => {
                const st = BOOKING_STATUS[b.status] ?? BOOKING_STATUS.pending
                return (
                  <div key={b.id} className={`px-4 py-3 flex items-center gap-3 ${i < recentBookings.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{b.customer_name || '—'}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {(b.business as { name?: string } | null)?.name ?? '—'} · {b.booking_date} {b.start_time?.slice(0,5)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${st.cls}`}>{st.label}</span>
                    {b.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleBookingAction(b.id, 'confirm')}
                          disabled={actionLoading === `booking-${b.id}`}
                          className="w-6 h-6 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                          title="Tasdiqlash"
                        >
                          <CheckCircle size={12} />
                        </button>
                        <button
                          onClick={() => handleBookingAction(b.id, 'cancel')}
                          disabled={actionLoading === `booking-${b.id}`}
                          className="w-6 h-6 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors disabled:opacity-50"
                          title="Bekor qilish"
                        >
                          <XCircle size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
