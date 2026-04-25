'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Search } from 'lucide-react'

type FilterType = 'all' | 'pending' | 'confirmed' | 'cancelled'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadBookings = useCallback(async (f: FilterType) => {
    setLoading(true)
    const res = await fetch(`/api/admin/bookings?filter=${f}`)
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadBookings(filter) }, [filter, loadBookings])

  const handleAction = async (id: string, action: 'confirm' | 'cancel') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.id === id
            ? { ...b, status: action === 'confirm' ? 'confirmed' : 'cancelled' }
            : b
        ))
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = bookings.filter(b => {
    const term = search.toLowerCase()
    return (
      (b.customer_name || '').toLowerCase().includes(term) ||
      (b.customer_phone || '').includes(term) ||
      ((b.business?.name) || '').toLowerCase().includes(term)
    )
  })

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Barchasi' },
    { value: 'pending', label: 'Kutilayotgan' },
    { value: 'confirmed', label: 'Tasdiqlangan' },
    { value: 'cancelled', label: 'Bekor qilingan' },
  ]

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">Kutilmoqda</span>
      case 'confirmed': return <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg font-medium">Tasdiqlangan</span>
      case 'completed': return <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">Yakunlangan</span>
      case 'cancelled': return <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg font-medium">Bekor</span>
      case 'no_show': return <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">Kelmadi</span>
      default: return <span>{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bronlar</h1>
        <p className="text-slate-400 text-sm mt-0.5">Barcha mijozlarning bron buyurtmalari</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ism, nomer yoki biznes nomi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div>Mijoz</div>
          <div>Biznes & Vaqt</div>
          <div>Telefon</div>
          <div>Holat</div>
          <div>Amallar</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            Hech narsa topilmadi
          </div>
        ) : (
          filtered.map((b, i) => (
            <div
              key={b.id}
              className={`grid grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] px-5 py-4 items-center gap-3 ${i < filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{b.customer_name || '—'}</p>
                <p className="text-xs text-slate-400 truncate">{new Date(b.created_at).toLocaleString('uz-UZ')}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{b.business?.name || '—'}</p>
                <p className="text-xs text-slate-500 truncate">{b.booking_date} {b.start_time?.slice(0, 5)}</p>
              </div>
              <div className="text-sm text-slate-600 font-mono">
                {b.customer_phone || '—'}
              </div>
              <div>
                {getStatusLabel(b.status)}
              </div>
              <div className="flex gap-1.5">
                {b.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(b.id, 'confirm')}
                      disabled={actionLoading === b.id}
                      className="flex items-center justify-center w-8 h-8 bg-green-50 hover:bg-green-100 disabled:opacity-50 text-green-600 rounded-lg transition-colors"
                      title="Tasdiqlash"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleAction(b.id, 'cancel')}
                      disabled={actionLoading === b.id}
                      className="flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-lg transition-colors"
                      title="Bekor qilish"
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
