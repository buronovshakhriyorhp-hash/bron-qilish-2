'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Star, Search, CheckCircle, SlidersHorizontal, Clock, ArrowRight, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'
import type { Business } from '@/types'

const DISTRICTS = ['Yunusobod', 'Chilonzor', 'Mirzo Ulug\'bek', 'Shayxontohur', 'Yakkasaroy', 'Uchtepa', 'Bektemir', 'Sergeli']
const CATEGORIES = [
  { slug: 'restoran', name: 'Restoran' },
  { slug: 'shifokor', name: 'Shifokor' },
  { slug: 'beauty', name: 'Beauty' },
  { slug: 'sartarosh', name: 'Sartarosh' },
  { slug: 'sport', name: 'Sport Zal' },
  { slug: 'mehmonxona', name: 'Mehmonxona' },
  { slug: 'avto', name: 'Avtoservis' },
  { slug: 'oquv', name: 'O\'quv markaz' },
]
const RATINGS = [{ label: '4.5+', value: 4.5 }, { label: '4.0+', value: 4.0 }, { label: '3.5+', value: 3.5 }]
const ITEMS_PER_PAGE = 12

function SearchContent() {
  const router = useRouter()
  const sp = useSearchParams()

  const [query, setQuery] = useState(sp.get('q') ?? '')
  const [district, setDistrict] = useState('')
  const [category, setCategory] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating')
  const [page, setPage] = useState(1)

  const [results, setResults] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  const activeFiltersCount = [district, category, minRating > 0].filter(Boolean).length

  const fetchResults = useCallback(async (q: string, d: string, cat: string, rating: number, sort: string, pg: number) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (d) params.set('district', d)
      if (cat) params.set('category', cat)
      if (rating > 0) params.set('minRating', String(rating))
      params.set('sortBy', sort)
      params.set('page', String(pg))

      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) throw new Error('Qidiruv xatosi')
      const data: { businesses: Business[]; total: number } = await res.json()
      setResults(data.businesses)
      setTotal(data.total)
    } catch {
      setError('Ma\'lumot olishda xato yuz berdi')
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedFetch = useDebouncedCallback(fetchResults, 350)

  useEffect(() => {
    debouncedFetch(query, district, category, minRating, sortBy, page)
  }, [query, district, category, minRating, sortBy, page, debouncedFetch])

  const clearFilters = () => {
    setDistrict('')
    setCategory('')
    setMinRating(0)
    setPage(1)
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Search header */}
      <div className="sticky top-16 z-30" style={{ background: 'rgba(248,247,255,.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            <div
              className="flex items-center gap-3 flex-1 rounded-xl px-4 py-2.5 transition-all"
              style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)' }}
              onFocusCapture={e => { ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'; ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
              onBlurCapture={e => { ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; ;(e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
            >
              <Search size={17} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && router.push(`/search?q=${query}`)}
                placeholder="Restoran, shifokor, sartarosh..."
                className="flex-1 text-sm bg-transparent outline-none font-medium"
                style={{ color: 'var(--text-primary)' }}
              />
              {query && (
                <button onClick={() => handleQueryChange('')} style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={showFilters || activeFiltersCount > 0
                ? { background: 'linear-gradient(135deg, var(--brand), var(--accent))', color: 'white', border: 'none', boxShadow: 'var(--shadow-brand)' }
                : { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }
              }
            >
              <SlidersHorizontal size={16} />
              Filter
              {activeFiltersCount > 0 && (
                <span className="rounded-full w-5 h-5 text-xs font-black flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,.25)', color: 'white' }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 p-4 rounded-2xl animate-fade-up" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-light)' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Tuman</label>
                  <select
                    value={district}
                    onChange={e => { setDistrict(e.target.value); setPage(1) }}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors"
                    style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Barchasi</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Kategoriya</label>
                  <select
                    value={category}
                    onChange={e => { setCategory(e.target.value); setPage(1) }}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors"
                    style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Barchasi</option>
                    {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Minimal reyting</label>
                  <div className="flex gap-2">
                    {RATINGS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => { setMinRating(minRating === r.value ? 0 : r.value); setPage(1) }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={minRating === r.value
                          ? { border: '2px solid #F59E0B', background: '#FEF3C7', color: '#92400E' }
                          : { border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }
                        }
                      >
                        ⭐ {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="mt-3 text-xs font-medium flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--danger)' }}>
                  <X size={12} /> Filtrlarni tozalash
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            {loading ? (
              <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={14} className="animate-spin" /> Qidirilmoqda...
              </span>
            ) : (
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {query ? <><span style={{ color: 'var(--brand)' }}>"{query}"</span> bo'yicha </> : 'Barcha '}
                <span style={{ color: 'var(--text-muted)' }}>{total} ta natija</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {(['rating', 'reviews'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setSortBy(s); setPage(1) }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={sortBy === s
                  ? { background: 'linear-gradient(135deg, var(--brand), var(--accent))', color: 'white' }
                  : { color: 'var(--text-muted)' }
                }
              >
                {s === 'rating' ? '⭐ Reyting' : '💬 Izohlar'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl p-4 mb-5 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length === 0 && !error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Natija topilmadi</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Boshqa kalit so'z yoki filtr sinab ko'ring</p>
            <button onClick={clearFilters} className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-[var(--radius-lg)] overflow-hidden skeleton" style={{ height: 280 }} />
                  ))
                : results.map((biz, i) => (
                    <BusinessCard key={biz.id} biz={biz} index={i} />
                  ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10 h-10 rounded-xl text-sm font-semibold transition-all"
                      style={page === pageNum
                        ? { background: 'linear-gradient(135deg, var(--brand), var(--accent))', color: 'white' }
                        : { border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }
                      }
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function BusinessCard({ biz, index }: { biz: Business; index: number }) {
  const image = biz.cover_image || biz.images?.[0]
  const categoryName = biz.category?.name_uz ?? ''
  const priceLabel = biz.services?.[0]?.price_label

  return (
    <Link
      href={`/business/${biz.id}`}
      className="card card-hover group overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 200, background: 'var(--surface-2)' }}>
        {image ? (
          <img
            src={image}
            alt={biz.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {biz.category?.icon ?? '🏢'}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 60%)' }} />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {biz.is_verified && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: 'rgba(79,70,229,.9)' }}>
              <CheckCircle size={10} /> Tasdiqlangan
            </span>
          )}
          {biz.is_featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: 'rgba(245,158,11,.9)' }}>Top</span>
          )}
        </div>

        {/* Rating pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(4px)', color: 'var(--text-primary)' }}>
          <Star size={11} className="fill-amber-400 text-amber-400" />
          {biz.rating.toFixed(1)}
        </div>

        {/* Category bottom-left */}
        {categoryName && (
          <div className="absolute bottom-3 left-3 text-white text-sm font-medium">
            {biz.category?.icon} {categoryName}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 14px' }}>
        <h3 className="font-heading font-bold text-base mb-1 transition-colors group-hover:text-[var(--brand)]"
          style={{ color: 'var(--text-primary)' }}>
          {biz.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={12} />
          <span>{biz.district ?? biz.city}</span>
          <span className="mx-0.5">·</span>
          <span>{biz.review_count} izoh</span>
          {priceLabel && (
            <>
              <span className="mx-0.5">·</span>
              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{priceLabel}</span>
            </>
          )}
        </div>
        <button className="btn btn-primary w-full justify-center" style={{ padding: '10px', fontSize: '0.875rem' }}>
          <Clock size={14} /> Bron qilish
          <ArrowRight size={14} className="ml-auto group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </Link>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
