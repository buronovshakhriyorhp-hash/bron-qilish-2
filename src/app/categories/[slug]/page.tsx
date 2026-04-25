import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Star, ChevronLeft, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { getBusinessesByCategory, getCategories, ITEMS_PER_PAGE } from '@/lib/db/server-queries'
import type { Business } from '@/types'

const DISTRICTS = ['Yunusobod', 'Chilonzor', 'Mirzo Ulugbek', 'Shayxontohur', 'Mirobod', 'Sergeli', 'Uchtepa', 'Yakkasaroy']

interface PageProps {
  params: { slug: string }
  searchParams: { district?: string; sort?: string; page?: string }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const categories = await getCategories()
  const cat = categories.find(c => c.slug === params.slug)
  return {
    title: cat ? `${cat.name_uz} — BronUz` : 'Kategoriya',
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const categories = await getCategories()
  const cat = categories.find(c => c.slug === params.slug)
  if (!cat) notFound()

  const district = searchParams.district ?? ''
  const sort = (searchParams.sort ?? 'rating') as 'rating' | 'reviews' | 'newest'
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))

  const { businesses, total } = await getBusinessesByCategory(params.slug, { district, sortBy: sort, page })
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const buildUrl = (overrides: Record<string, string | number>) => {
    const sp = new URLSearchParams()
    if (district) sp.set('district', district)
    if (sort !== 'rating') sp.set('sort', sort)
    if (page > 1) sp.set('page', String(page))
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) sp.set(k, String(v))
      else sp.delete(k)
    })
    const qs = sp.toString()
    return `/categories/${params.slug}${qs ? `?${qs}` : ''}`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HERO HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* blobs */}
        <div style={{ position: 'absolute', top: 0, left: '20%', width: 360, height: 360, background: 'rgba(79,70,229,.1)', borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '15%', width: 280, height: 280, background: 'rgba(124,58,237,.08)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 32px 36px', position: 'relative' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.8rem' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.4)', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.75)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.4)' }}>
              Bosh sahifa
            </Link>
            <span style={{ color: 'rgba(255,255,255,.2)' }}>/</span>
            <Link href="/categories" style={{ color: 'rgba(255,255,255,.4)', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.75)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.4)' }}>
              Kategoriyalar
            </Link>
            <span style={{ color: 'rgba(255,255,255,.2)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,.65)' }}>{cat.name_uz}</span>
          </div>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link
              href="/categories"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.12)', flexShrink: 0, transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,.08)' }}
            >
              <ChevronLeft size={18} />
            </Link>

            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
              {cat.icon}
            </div>

            <div>
              <h1 className="font-heading" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: 4 }}>
                {cat.name_uz}
              </h1>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '0.875rem' }}>
                {total} ta joy topildi{district ? ` · ${district}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div style={{ background: 'rgba(248,247,255,.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 64, zIndex: 30 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 32px', overflowX: 'auto' }}>
          {/* District pills */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 'max-content' }}>
            <Link
              href={buildUrl({ district: '', page: 1 })}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '7px 16px',
                borderRadius: 100,
                fontSize: '0.8rem', fontWeight: 600,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                textDecoration: 'none',
                background: !district ? 'linear-gradient(135deg, var(--brand), var(--accent))' : 'var(--surface)',
                color: !district ? 'white' : 'var(--text-secondary)',
                border: !district ? 'none' : '1px solid var(--border)',
                boxShadow: !district ? '0 2px 8px rgba(79,70,229,.3)' : 'none',
              }}
            >
              Barcha tumanlar
            </Link>
            {DISTRICTS.map(d => (
              <Link
                key={d}
                href={buildUrl({ district: d, page: 1 })}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '7px 16px',
                  borderRadius: 100,
                  fontSize: '0.8rem', fontWeight: 600,
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  background: district === d ? 'linear-gradient(135deg, var(--brand), var(--accent))' : 'var(--surface)',
                  color: district === d ? 'white' : 'var(--text-secondary)',
                  border: district === d ? 'none' : '1px solid var(--border)',
                  boxShadow: district === d ? '0 2px 8px rgba(79,70,229,.3)' : 'none',
                }}
              >
                {d}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 64px' }}>

        {/* Sort + count row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{total}</span> ta natija
            {district ? <> · <span style={{ color: 'var(--brand)' }}>{district}</span></> : ''}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4 }}>
            {[
              { value: 'rating',  label: '⭐ Reyting' },
              { value: 'reviews', label: '💬 Izohlar' },
              { value: 'newest',  label: '🆕 Yangi' },
            ].map(s => (
              <Link
                key={s.value}
                href={buildUrl({ sort: s.value, page: 1 })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  background: sort === s.value ? 'linear-gradient(135deg, var(--brand), var(--accent))' : 'transparent',
                  color: sort === s.value ? 'white' : 'var(--text-muted)',
                }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        {businesses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏢</div>
            <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Hozircha biznes yo'q</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>Bu kategoriyada hali biznes qo'shilmagan</p>
            {district && (
              <Link
                href={buildUrl({ district: '', page: 1 })}
                className="btn btn-secondary"
                style={{ padding: '10px 24px', fontSize: '0.875rem' }}
              >
                Barcha tumanlarda ko'rish
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {businesses.map((biz, i) => (
              <BizCard key={biz.id} biz={biz} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {page > 1 && (
              <Link
                href={buildUrl({ page: page - 1 })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
              >
                ← Oldingi
              </Link>
            )}
            <span style={{ padding: '9px 16px', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={buildUrl({ page: page + 1 })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
              >
                Keyingi →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function BizCard({ biz, index }: { biz: Business; index: number }) {
  const image = biz.cover_image ?? biz.images?.[0]
  const priceLabel = biz.services?.[0]?.price_label

  return (
    <Link
      href={`/business/${biz.id}`}
      className="card card-hover group overflow-hidden animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 192, overflow: 'hidden', background: 'var(--surface-2)' }}>
        {image ? (
          <img
            src={image}
            alt={biz.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            className="group-hover:scale-105"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
            {biz.category?.icon ?? '🏢'}
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.45) 0%, transparent 60%)' }} />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {biz.is_verified && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(79,70,229,.9)', color: 'white' }}>
              <CheckCircle size={9} /> Tasdiqlangan
            </span>
          )}
          {biz.is_featured && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(245,158,11,.9)', color: 'white' }}>
              Top
            </span>
          )}
        </div>

        {/* Rating pill */}
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(4px)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <Star size={11} style={{ fill: '#F59E0B', color: '#F59E0B' }} />
          {biz.rating.toFixed(1)}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 14px' }}>
        <h3
          className="font-heading group-hover:text-[var(--brand)]"
          style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 6, transition: 'color 0.2s', lineHeight: 1.3 }}
        >
          {biz.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
          <MapPin size={12} style={{ flexShrink: 0 }} />
          <span>{biz.district ?? biz.city}</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>{biz.review_count} izoh</span>
          {priceLabel && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{priceLabel}</span>
            </>
          )}
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Clock size={13} /> Bron qilish
          <ArrowRight size={13} style={{ marginLeft: 'auto' }} />
        </button>
      </div>
    </Link>
  )
}
