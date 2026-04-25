'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import type { Business } from '@/types'

type FilterType = 'all' | 'pending' | 'active'

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadBusinesses = useCallback(async (f: FilterType) => {
    setLoading(true)
    const res = await fetch(`/api/admin/businesses?filter=${f}`)
    const data = await res.json() as { businesses: Business[] }
    setBusinesses(data.businesses || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadBusinesses(filter) }, [filter, loadBusinesses])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setBusinesses(prev => prev.map(b =>
          b.id === id
            ? { ...b, is_verified: action === 'approve', is_active: action === 'approve' }
            : b
        ))
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.address ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (b.phone ?? '').includes(search)
  )

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Barchasi' },
    { value: 'pending', label: 'Kutilayotgan' },
    { value: 'active', label: 'Faol' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bizneslar</h1>
        <p className="text-slate-400 text-sm mt-0.5">Barcha ro'yxatdan o'tgan bizneslar</p>
      </div>

      {/* Filters & search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div>Biznes</div>
          <div>Kategoriya</div>
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
          filtered.map((biz, i) => (
            <div
              key={biz.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-4 items-center gap-3 ${i < filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div>
                <p className="font-semibold text-slate-800 truncate">{biz.name}</p>
                <p className="text-xs text-slate-400 truncate">{biz.address ?? '—'}</p>
              </div>
              <div className="text-sm text-slate-600">
                {(biz.category as { name_uz?: string } | undefined)?.name_uz ?? '—'}
              </div>
              <div className="text-sm text-slate-600">{biz.phone ?? '—'}</div>
              <div>
                {biz.is_verified ? (
                  <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-lg font-medium">Tasdiqlangan</span>
                ) : biz.is_active ? (
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-medium">Faol</span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">Kutilmoqda</span>
                )}
              </div>
              <div className="flex gap-1.5">
                {!biz.is_verified && (
                  <>
                    <button
                      onClick={() => handleAction(biz.id, 'approve')}
                      disabled={actionLoading === biz.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <CheckCircle size={12} /> Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleAction(biz.id, 'reject')}
                      disabled={actionLoading === biz.id}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <XCircle size={12} /> Rad
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
