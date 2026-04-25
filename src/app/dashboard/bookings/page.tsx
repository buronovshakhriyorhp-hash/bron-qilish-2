'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getOwnerBusinesses, getBusinessBookings, updateBookingStatus } from '@/lib/db/queries'
import type { Business, Booking } from '@/types'
import toast from 'react-hot-toast'
import { Calendar, Clock, Phone, CheckCircle, XCircle, AlertCircle, Loader2, User } from 'lucide-react'

const UZ_MONTHS = ['Yan','Fev','Mar','Apr','May','Iyu','Iyu','Avg','Sen','Okt','Noy','Dek']
function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${d} ${UZ_MONTHS[m-1]} ${y}`
}

const STATUS_CONFIG = {
  pending:   { label: 'Kutilmoqda',     color: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-400' },
  confirmed: { label: 'Tasdiqlangan',   color: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  cancelled: { label: 'Bekor qilingan', color: 'bg-red-50 text-red-700 border-red-200',        dot: 'bg-red-400' },
  completed: { label: 'Yakunlangan',    color: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500' },
  no_show:   { label: 'Kelmadi',        color: 'bg-slate-50 text-slate-600 border-slate-200',  dot: 'bg-slate-400' },
}

export default function DashboardBookingsPage() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBizId, setSelectedBizId] = useState<string>('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getOwnerBusinesses(user.id).then(list => {
      setBusinesses(list)
      if (list.length > 0) setSelectedBizId(list[0].id)
    })
  }, [user])

  useEffect(() => {
    if (!selectedBizId) return
    setLoading(true)
    getBusinessBookings(selectedBizId).then(data => {
      setBookings(data)
      setLoading(false)
    })
  }, [selectedBizId])

  const handleStatus = async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed' | 'no_show') => {
    setUpdatingId(bookingId)
    const ok = await updateBookingStatus(bookingId, status)
    if (ok) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
      const labels = { confirmed: 'Tasdiqlandi ✓', cancelled: 'Bekor qilindi', completed: 'Yakunlandi', no_show: 'Kelmadi deb belgilandi' }
      toast.success(labels[status])
    } else {
      toast.error('Xatolik yuz berdi')
    }
    setUpdatingId(null)
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Bronlar boshqaruvi</h1>
        <p className="text-slate-500 text-sm mt-1">Bronlarni ko'ring, tasdiqlang yoki bekor qiling</p>
      </div>

      {/* Biznes tanlash */}
      {businesses.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {businesses.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBizId(b.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedBizId === b.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-slate-500">Hali biznes qo'shilmagan</p>
        </div>
      ) : (
        <>
          {/* Filter tablar */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {([
              { key: 'all',       label: `Barchasi (${counts.all})` },
              { key: 'pending',   label: `Kutilmoqda (${counts.pending})` },
              { key: 'confirmed', label: `Tasdiqlangan (${counts.confirmed})` },
              { key: 'completed', label: `Yakunlangan (${counts.completed})` },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bronlar ro'yxati */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-500">Hali bronlar yo'q</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(booking => {
                const st = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
                const isUpdating = updatingId === booking.id

                return (
                  <div key={booking.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{booking.customer_name || 'Noma\'lum'}</p>
                            {booking.customer_phone && (
                              <a href={`tel:${booking.customer_phone}`} className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                                <Phone size={10} /> {booking.customer_phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${st.color}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-blue-400" />
                          {formatDate(booking.booking_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-blue-400" />
                          {booking.start_time?.slice(0,5)} — {booking.end_time?.slice(0,5)}
                        </span>
                        {(booking.service as any)?.name && (
                          <span className="col-span-2 bg-slate-50 px-2 py-1 rounded-lg">
                            ✂️ {(booking.service as any).name}
                          </span>
                        )}
                        {booking.customer_note && (
                          <span className="col-span-2 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">
                            💬 {booking.customer_note}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amallar */}
                    {booking.status === 'pending' && (
                      <div className="border-t border-slate-50 px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleStatus(booking.id, 'confirmed')}
                          disabled={isUpdating}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-60"
                        >
                          {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={14} />}
                          Tasdiqlash
                        </button>
                        <button
                          onClick={() => handleStatus(booking.id, 'cancelled')}
                          disabled={isUpdating}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium disabled:opacity-60"
                        >
                          <XCircle size={14} /> Rad etish
                        </button>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="border-t border-slate-50 px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleStatus(booking.id, 'completed')}
                          disabled={isUpdating}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
                        >
                          {isUpdating ? <Loader2 size={13} className="animate-spin" /> : '✓'}
                          Yakunlandi
                        </button>
                        <button
                          onClick={() => handleStatus(booking.id, 'no_show')}
                          disabled={isUpdating}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium disabled:opacity-60"
                        >
                          <AlertCircle size={14} /> Kelmadi
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
