'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronRight, Loader2, LogOut, Phone, MapPin, Star, PlusCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserBookings, cancelBooking } from '@/lib/db/queries'
import type { Booking } from '@/types'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; Icon: any; dot: string }> = {
  pending:   { label: 'Kutilmoqda',     badgeClass: 'badge badge-amber',  Icon: AlertCircle, dot: 'dot-amber' },
  confirmed: { label: 'Tasdiqlangan',   badgeClass: 'badge badge-green',  Icon: CheckCircle, dot: 'dot-green' },
  cancelled: { label: 'Bekor qilingan', badgeClass: 'badge badge-red',    Icon: XCircle,     dot: 'dot-red'   },
  completed: { label: 'Yakunlangan',    badgeClass: 'badge badge-blue',   Icon: CheckCircle, dot: 'dot-blue'  },
  no_show:   { label: 'Kelmadi',        badgeClass: 'badge badge-slate',  Icon: XCircle,     dot: 'dot-slate' },
}

const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${UZ_MONTHS[m - 1]} ${y}`
}

// ---- Empty State ----
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-up">
      <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-5xl mb-5 animate-float">
        {filtered ? '🔍' : '📭'}
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        {filtered ? 'Natija topilmadi' : 'Hali bronlar yo\'q'}
      </h2>
      <p className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
        {filtered
          ? 'Bu filtr bo\'yicha bronlar mavjud emas'
          : 'Xizmatlarni topib, birinchi broningizni qiling va vaqtingizni tejang!'
        }
      </p>
      {!filtered && (
        <Link
          href="/"
          className="btn btn-primary px-7 py-3 rounded-2xl"
        >
          Xizmat qidirish
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  )
}

// ---- Booking Card ----
function BookingCard({
  booking,
  onCancel,
  cancellingId,
}: {
  booking: Booking
  onCancel: (id: string) => void
  cancellingId: string | null
}) {
  const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
  const { Icon } = st
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const biz = booking.business as any
  const service = booking.service as any
  const isCancelling = cancellingId === booking.id

  return (
    <div className="card card-hover overflow-hidden animate-fade-up">
      <div className="p-4">
        <div className="flex gap-3.5">
          {/* Biznes rasmi / placeholder */}
          {biz?.cover_image ? (
            <img
              src={biz.cover_image}
              alt={biz.name}
              className="w-16 h-16 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl shrink-0 border border-blue-100">
              🏢
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Top row: name + status */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-slate-800 text-sm leading-tight truncate">
                {biz?.name || "Noma'lum joy"}
              </h3>
              <span className={`${st.badgeClass} shrink-0`}>
                <Icon size={10} />
                {st.label}
              </span>
            </div>

            {/* Service */}
            {service?.name && (
              <p className="text-xs text-blue-600 font-medium mb-2 truncate bg-blue-50 inline-block px-2 py-0.5 rounded-full">
                {service.name}
              </p>
            )}

            {/* Date + time */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-slate-400" />
                {formatDate(booking.booking_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                {booking.start_time.slice(0, 5)}
              </span>
              {biz?.address && (
                <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  {biz.address}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {(canCancel || biz?.id || booking.status === 'completed') && (
        <div className="border-t border-slate-100 px-4 py-3 flex gap-2 bg-slate-50/50">
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={isCancelling}
              className="btn btn-danger flex-1 py-2 rounded-xl text-xs"
            >
              {isCancelling ? <Loader2 size={13} className="animate-spin" /> : (
                <>
                  <XCircle size={13} />
                  Bekor qilish
                </>
              )}
            </button>
          )}
          {biz?.id && (
            <Link
              href={`/business/${biz.id}`}
              className="btn btn-secondary flex-1 py-2 rounded-xl text-xs justify-center"
            >
              <MapPin size={13} />
              Joyga o'tish
            </Link>
          )}
          {booking.status === 'completed' && (
            <button className="btn flex-1 py-2 rounded-xl text-xs bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100">
              <Star size={13} />
              Izoh yozing
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Main Profile Page ----
export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/profile')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setLoadingBookings(true)
    getUserBookings(user.id)
      .then(data => setBookings(data))
      .finally(() => setLoadingBookings(false))
  }, [user])

  const handleCancel = async (bookingId: string) => {
    if (!user) return
    if (!confirm('Bronni bekor qilmoqchimisiz?')) return
    setCancellingId(bookingId)
    const ok = await cancelBooking(bookingId, user.id)
    if (ok) {
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
      )
      toast.success('Bron bekor qilindi')
    } else {
      toast.error('Xatolik yuz berdi')
    }
    setCancellingId(null)
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm animate-pulse">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const phoneDigits = user.phone?.replace('+998', '') || ''
  const avatarLetter = phoneDigits[0] || '?'
  const phoneFormatted = user.phone
    ? user.phone.replace('+998', '+998 ').replace(/(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
    : "Noma'lum"

  const STATS = [
    { label: 'Jami', value: counts.all, color: 'text-white' },
    { label: 'Kutilmoqda', value: counts.pending, color: 'text-amber-200' },
    { label: 'Tasdiqlangan', value: counts.confirmed, color: 'text-green-200' },
    { label: 'Yakunlangan', value: counts.completed, color: 'text-blue-200' },
  ]

  const FILTER_TABS = [
    { key: 'all' as const, label: 'Barchasi', count: counts.all },
    { key: 'pending' as const, label: 'Kutilmoqda', count: counts.pending },
    { key: 'confirmed' as const, label: 'Tasdiqlangan', count: counts.confirmed },
    { key: 'completed' as const, label: 'Yakunlangan', count: counts.completed },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ---- GRADIENT HEADER ---- */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-400/10 rounded-full" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 pt-8 pb-0">
          {/* Top row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg">
                {avatarLetter}
              </div>
              <div>
                <p className="text-blue-200 text-xs font-medium mb-0.5">Mening profilim</p>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-blue-300" />
                  <h1 className="font-bold text-white text-lg tracking-wide">{phoneFormatted}</h1>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="status-dot dot-green pulse" />
                  <span className="text-green-300 text-xs font-medium">Faol</span>
                </div>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-2xl transition-all"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15 mb-6">
            {STATS.map((s, i) => (
              <div key={s.label} className={`text-center ${i !== 0 ? 'border-l border-white/15' : ''}`}>
                <div className="text-2xl font-extrabold text-white tabular-nums">{s.value}</div>
                <div className={`text-xs font-medium mt-0.5 ${s.color}`}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs — part of header visually */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  filter === tab.key
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'bg-white/10 text-blue-100 border border-white/20 hover:bg-white/20'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                    filter === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-white/10 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- BOOKINGS LIST ---- */}
      <div className="max-w-2xl mx-auto px-4 py-5">
        {loadingBookings ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex gap-3.5">
                  <div className="skeleton w-16 h-16 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="skeleton h-4 rounded-full w-3/4" />
                    <div className="skeleton h-3 rounded-full w-1/2" />
                    <div className="skeleton h-3 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState filtered={filter !== 'all'} />
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking, idx) => (
              <div key={booking.id} className={`delay-${Math.min(idx * 100, 300)}`}>
                <BookingCard
                  booking={booking}
                  onCancel={handleCancel}
                  cancellingId={cancellingId}
                />
              </div>
            ))}
          </div>
        )}

        {/* New booking CTA */}
        {filteredBookings.length > 0 && (
          <div className="mt-6 card p-5 text-center border-dashed border-2 border-blue-200 bg-blue-50/50 animate-fade-up">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-slate-600 text-sm font-medium mb-3">Yangi xizmat qidirmoqchimisiz?</p>
            <Link
              href="/"
              className="btn btn-primary inline-flex px-6 py-2.5 rounded-xl text-sm"
            >
              <PlusCircle size={15} />
              Yangi bron qilish
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
