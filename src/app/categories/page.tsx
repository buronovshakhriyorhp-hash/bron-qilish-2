'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, TrendingUp } from 'lucide-react'

const CATEGORIES = [
  { slug: 'restoran',   name_uz: 'Restoran & Kafe',    icon: '🍽️', color: '#ef4444', bg: '#fef2f2', count: 240, desc: 'Eng yaxshi restoranlar va kafeler' },
  { slug: 'shifokor',   name_uz: 'Shifokor & Klinika', icon: '🏥', color: '#16a34a', bg: '#f0fdf4', count: 185, desc: 'Malakali shifokorlar va klinikalar' },
  { slug: 'sartarosh',  name_uz: 'Sartaroshxona',      icon: '💈', color: '#9333ea', bg: '#faf5ff', count: 320, desc: 'Soch turmak va parvarishlash' },
  { slug: 'beauty',     name_uz: 'Beauty Salon',        icon: '💅', color: '#db2777', bg: '#fdf2f8', count: 290, desc: "Go'zallik va parvarishlash xizmatlari" },
  { slug: 'mehmonxona', name_uz: 'Mehmonxona',          icon: '🏨', color: '#d97706', bg: '#fffbeb', count: 75,  desc: 'Qulay mehmonxonalar va hostellar' },
  { slug: 'sport',      name_uz: 'Sport Zal',           icon: '🏋️', color: '#0891b2', bg: '#f0fdff', count: 130, desc: 'Fitnes va sport muassasalari' },
  { slug: 'avto',       name_uz: 'Avto-servis',         icon: '🚗', color: '#475569', bg: '#f8fafc', count: 95,  desc: "Avtomobil ta'miri va xizmati" },
  { slug: 'oquv',       name_uz: "O'quv Markaz",        icon: '📚', color: '#7c3aed', bg: '#f5f3ff', count: 160, desc: "Ta'lim va o'quv markazlari" },
]

const TOTAL_BUSINESSES = CATEGORIES.reduce((acc, c) => acc + c.count, 0)

export default function CategoriesPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CATEGORIES
    return CATEGORIES.filter(
      c => c.name_uz.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ---- HERO / HEADER ---- */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 100%)' }}>
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-xs font-semibold animate-fade-up"
            style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.7)' }}>
            <TrendingUp size={13} />
            {TOTAL_BUSINESSES.toLocaleString()}+ biznes platformada
          </div>

          <h1 className="font-heading font-extrabold text-white mb-3 tracking-tight animate-fade-up delay-100"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', letterSpacing: '-0.04em' }}>
            Barcha{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>xizmatlar</span>
          </h1>
          <p className="mb-8 animate-fade-up delay-200 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,.55)', fontSize: '1rem' }}>
            O'zingizga kerakli xizmat turini tanlang va darhol bron qiling
          </p>

          {/* Search input */}
          <div className="relative max-w-md mx-auto animate-fade-up delay-300">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Kategoriya qidiring..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-medium outline-none transition-all"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-lg)',
                border: '1.5px solid var(--border)',
              }}
              onFocus={e => { ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)' }}
              onBlur={e => { ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}
              >✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ---- GRID ---- */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Natija topilmadi</h2>
            <p className="text-slate-500 text-sm mb-5">
              "<span className="font-semibold text-slate-700">{query}</span>" bo'yicha kategoriya yo'q
            </p>
            <button
              onClick={() => setQuery('')}
              className="btn btn-secondary px-5 py-2.5 rounded-xl text-sm"
            >
              Hammasini ko'rish
            </button>
          </div>
        ) : (
          <>
            {/* Result count */}
            {query && (
              <p className="text-sm text-slate-500 mb-4 animate-fade-up">
                <span className="font-semibold text-slate-700">{filtered.length}</span> ta kategoriya topildi
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((cat, idx) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className={`card card-hover group flex flex-col p-5 animate-fade-up delay-${Math.min(idx * 100, 300)} relative overflow-hidden`}
                >
                  {/* Background gradient on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[var(--radius-xl)]"
                    style={{ background: `linear-gradient(135deg, ${cat.bg}, white)` }}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: cat.bg, border: `2px solid ${cat.color}18` }}
                    >
                      {cat.icon}
                    </div>

                    {/* Name */}
                    <h2
                      className="font-bold text-slate-800 text-sm leading-tight mb-1 transition-colors duration-200 group-hover:text-[var(--c)]"
                      style={{ '--c': cat.color } as React.CSSProperties}
                    >
                      {cat.name_uz}
                    </h2>

                    {/* Desc */}
                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                      {cat.desc}
                    </p>

                    {/* Footer: count + arrow */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        {cat.count}+ joy
                      </span>
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <ArrowRight size={13} className="text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div
          className="mt-10 relative overflow-hidden rounded-[var(--radius-xl)] p-8 text-center animate-fade-up"
          style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)' }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full"
            style={{ background: 'rgba(255,255,255,.07)' }} />
          <h3 className="font-heading font-bold text-xl text-white mb-1 relative z-10">Biznesingiz bormi?</h3>
          <p className="text-sm mb-5 relative z-10" style={{ color: 'rgba(255,255,255,.7)' }}>Platformaga qo'shing va minglab mijozlarga yeting</p>
          <Link
            href="/business/register"
            className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-[var(--radius-md)] text-sm transition-all hover:-translate-y-0.5 relative z-10"
            style={{ background: 'white', color: 'var(--brand)' }}
          >
            Biznes qo'shish <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
