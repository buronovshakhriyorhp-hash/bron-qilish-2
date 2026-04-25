'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Star, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react'

const CATEGORIES = [
  { slug: 'restoran',   name_uz: 'Restoran',      icon: '🍽️', color: '#EF4444', bg: '#FEE2E2', count: 240, desc: 'Qulay joy band qiling' },
  { slug: 'shifokor',   name_uz: 'Shifokor',       icon: '🏥', color: '#10B981', bg: '#D1FAE5', count: 185, desc: 'Navbatsiz qabul' },
  { slug: 'sartarosh',  name_uz: 'Sartarosh',      icon: '💈', color: '#8B5CF6', bg: '#EDE9FE', count: 320, desc: 'Real-time navbat' },
  { slug: 'beauty',     name_uz: 'Beauty',          icon: '💅', color: '#EC4899', bg: '#FCE7F3', count: 290, desc: 'Premium xizmat' },
  { slug: 'mehmonxona', name_uz: 'Mehmonxona',      icon: '🏨', color: '#F59E0B', bg: '#FEF3C7', count: 75,  desc: 'Xona bron qiling' },
  { slug: 'sport',      name_uz: 'Sport Zal',       icon: '🏋️', color: '#0EA5E9', bg: '#E0F2FE', count: 130, desc: 'Trenirovka rejimi' },
  { slug: 'avto',       name_uz: 'Avtoservis',      icon: '🚗', color: '#64748B', bg: '#F1F5F9', count: 95,  desc: 'Tez ta\'mirlash' },
  { slug: 'oquv',       name_uz: 'O\'quv markaz',   icon: '📚', color: '#7C3AED', bg: '#F5F3FF', count: 160, desc: 'Bilim olish joyi' },
]

const FEATURED = [
  {
    id: '1', name: 'Besh Qozon Restaurant', category: 'Restoran & Kafe', catIcon: '🍽️',
    address: 'Yunusobod, 19-mavze', rating: 4.8, reviews: 124,
    price: '50K — 150K so\'m', badge: 'Top restoran', badgeBg: 'rgba(239,68,68,.9)',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=320&fit=crop',
    open: true,
  },
  {
    id: '2', name: 'Dr. Azimov Klinikasi', category: 'Shifokor & Klinika', catIcon: '🏥',
    address: 'Chilonzor, 9-mavze', rating: 4.9, reviews: 87,
    price: '60K — 200K so\'m', badge: 'Tavsiya etiladi', badgeBg: 'rgba(16,185,129,.9)',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=320&fit=crop',
    open: true,
  },
  {
    id: '3', name: 'Glamour Beauty Salon', category: 'Beauty Salon', catIcon: '💅',
    address: 'Mirzo Ulugbek tumani', rating: 4.7, reviews: 203,
    price: '30K — 100K so\'m', badge: 'Mashhur', badgeBg: 'rgba(236,72,153,.9)',
    image: 'https://images.unsplash.com/photo-1560066984-138daaa17a84?w=500&h=320&fit=crop',
    open: false,
  },
]

const QUICK_TAGS = [
  { slug: 'sartarosh', label: '✂️ Sartarosh' },
  { slug: 'restoran',  label: '🍽️ Restoran'  },
  { slug: 'shifokor',  label: '🏥 Shifokor'  },
  { slug: 'beauty',    label: '💅 Beauty'     },
  { slug: 'sport',     label: '🏋️ Sport'      },
]

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(search.trim() ? `/search?q=${encodeURIComponent(search.trim())}` : '/search')
  }

  return (
    <div className="overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #F8F7FF 0%, #EEF2FF 100%)',
          minHeight: '100vh',
          paddingTop: 80,
        }}
      >
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,.07) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,.05) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-sm font-semibold animate-fade-up"
              style={{ background: 'var(--brand-light)', border: '1px solid rgba(79,70,229,.2)', color: 'var(--brand)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
              O'zbekistondagi №1 bron platforma
            </div>

            <h1 className="font-heading font-extrabold leading-[1.08] tracking-tight mb-5 animate-fade-up delay-100"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: 'var(--text-primary)' }}>
              Barcha xizmatlar<br />
              <span className="gradient-text">bir joyda.</span>
            </h1>

            <p className="mb-9 leading-relaxed animate-fade-up delay-200"
              style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 480 }}>
              Sartaroshxonadan mehmonxonagacha — real-time navbat va onlayn bron orqali
              vaqtingizni tejang. Telefonsiz, navbatsiz.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 mb-10 animate-fade-up delay-200">
              <Link
                href="/search"
                className="btn btn-primary"
                style={{ padding: '13px 26px', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
              >
                Xizmatlarni ko'rish →
              </Link>
              <Link
                href="/business/register"
                className="btn btn-secondary"
                style={{ padding: '13px 26px', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
              >
                Biznes qo'shish
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 animate-fade-up delay-300">
              {[
                { num: '10k+', label: 'Foydalanuvchi' },
                { num: '500+', label: 'Xizmat ko\'rsatuvchi' },
                { num: '4.9 ⭐', label: 'O\'rtacha reyting' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-heading font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{s.num}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — booking card */}
          <div className="relative hidden lg:block animate-fade-up delay-200">
            {/* Float top-right */}
            <div className="animate-float absolute -top-5 -right-5 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[var(--shadow)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', zIndex: 2 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: '#D1FAE5' }}>✅</div>
              <div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Bron holati</div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Tasdiqlandi</div>
              </div>
            </div>

            {/* Main card */}
            <div className="relative rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-lg)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', padding: 28 }}>
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, var(--brand), var(--accent))' }} />

              {/* Card header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>B</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Bugun uchun bron qiling</p>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: '#10B981' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Real-time navbat
                  </p>
                </div>
              </div>

              {/* Services grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { icon: '✂️', name: 'Sartarosh',  slots: '5 ta joy' },
                  { icon: '🏨', name: 'Mehmonxona', slots: '3 ta joy' },
                  { icon: '🏥', name: 'Shifokor',   slots: '8 ta joy' },
                  { icon: '💅', name: 'Beauty',      slots: '6 ta joy' },
                ].map(s => (
                  <div key={s.name}
                    className="card-hover rounded-[var(--radius-md)] p-3.5 cursor-pointer"
                    style={{ border: '1px solid var(--border-light)', background: 'var(--bg)' }}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.slots}</div>
                  </div>
                ))}
              </div>

              <Link href="/search"
                className="btn btn-primary w-full justify-center"
                style={{ padding: '13px', fontSize: '0.95rem', fontFamily: 'var(--font-sora, Sora)' }}>
                Bron qilish →
              </Link>
            </div>

            {/* Float bottom-left */}
            <div className="animate-float absolute -bottom-4 -left-10 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[var(--shadow)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', animationDelay: '1s', zIndex: 2 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: '#FEF3C7' }}>⭐</div>
              <div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>O'rtacha reyting</div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>4.9 / 5.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 p-2 rounded-[var(--radius-xl)] shadow-[var(--shadow)]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="pl-3 text-lg" style={{ color: 'var(--text-muted)' }}>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Xizmat yoki biznes qidiring..."
                className="flex-1 bg-transparent text-sm py-3.5 px-3 outline-none"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-dm, DM Sans)' }}
              />
              <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--border)' }} />
              <Link
                href="/nearby"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                📍 Yaqin joylarda
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
              >
                Qidirish →
              </button>
            </div>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_TAGS.map(t => (
              <Link
                key={t.slug}
                href={`/categories/${t.slug}`}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--brand)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--brand-light)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                }}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ KATEGORIYALAR ══════════ */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-9">
          <div>
            <h2 className="font-heading font-bold text-3xl tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Kategoriyalar
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Barcha mavjud xizmat turlari</p>
          </div>
          <Link href="/categories" className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--brand)' }}>
            Hammasini ko'rish <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="card card-hover group relative overflow-hidden animate-fade-up"
              style={{ padding: 22, animationDelay: `${i * 0.06}s` } as React.CSSProperties}
            >
              {/* Bottom accent on hover — done via CSS var */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

              <div className="w-13 h-13 rounded-[var(--radius-md)] flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: cat.bg, width: 52, height: 52 }}>
                {cat.icon}
              </div>

              <div className="font-heading font-bold text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>{cat.name_uz}</div>
              <div className="text-xs mb-4 leading-snug" style={{ color: 'var(--text-secondary)' }}>{cat.desc}</div>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>👥 {cat.count}+</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all group-hover:text-white"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}
                  onMouseEnter={() => {}} // handled by parent group
                >
                  <ArrowRight size={12} className="group-hover:hidden" />
                  <span className="hidden group-hover:inline">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════ MASHHUR JOYLAR ══════════ */}
      <section className="py-16 px-6" style={{ background: 'var(--surface-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-9">
            <div>
              <h2 className="font-heading font-bold text-3xl tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Mashhur bizneslar
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Eng ko'p bronlangan joylar</p>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--brand)' }}>
              Barchasi <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED.map((biz, i) => (
              <Link
                key={biz.id}
                href={`/business/${biz.id}`}
                className="card card-hover group overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative overflow-hidden" style={{ height: 200 }}>
                  <img
                    src={biz.image}
                    alt={biz.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)' }} />

                  {/* Open/closed badge */}
                  <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${biz.open ? 'bg-emerald-500/90' : 'bg-red-500/90'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${biz.open ? 'bg-white' : 'bg-white opacity-70'}`} />
                    {biz.open ? 'Ochiq' : 'Yopiq'}
                  </div>

                  {/* Category tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(4px)', color: 'var(--text-secondary)' }}>
                    {biz.catIcon} {biz.category}
                  </div>

                  {/* Custom badge */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: biz.badgeBg }}>
                    {biz.badge}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '18px 18px 16px' }}>
                  <h3 className="font-heading font-bold text-base mb-1 group-hover:text-[var(--brand)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {biz.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    <MapPin size={13} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="truncate">{biz.address}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{biz.rating}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({biz.reviews})</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{biz.price}</span>
                  </div>

                  <button className="btn btn-primary w-full justify-center mt-4"
                    style={{ padding: '10px', fontSize: '0.875rem' }}>
                    Bron qilish →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ QANDAY ISHLAYDI ══════════ */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-heading font-bold text-3xl tracking-tight mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Qanday ishlaydi?
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>4 ta oddiy qadam</p>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Connector line */}
          <div className="hidden md:block absolute top-9 left-[10%] right-[10%] h-px"
            style={{ background: 'linear-gradient(90deg, var(--brand), var(--accent), transparent)' }} />

          {[
            { n: '1', title: 'Xizmatni tanlang',     desc: 'Kategoriya yoki qidiruv orqali kerakli xizmatni va biznesni tanlang.' },
            { n: '2', title: 'Vaqtni belgilang',      desc: 'Bo\'sh vaqtlarni real-time ko\'ring va o\'zingizga qulay soatni tanlang.' },
            { n: '3', title: 'Tasdiqlang',             desc: 'Bron ma\'lumotlarini tekshirib, bir marta bosish orqali tasdiqlang.' },
            { n: '4', title: 'Xizmatdan foydalaning', desc: 'Belgilangan vaqtda boring va xizmatdan rohatlanib foydalaning.' },
          ].map((s, i) => (
            <div key={s.n} className="text-center relative group animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div
                className="w-[72px] h-[72px] rounded-full border-2 flex items-center justify-center font-heading text-2xl font-bold mx-auto mb-5 relative z-10 transition-all duration-300 group-hover:scale-110"
                style={{ borderColor: 'var(--brand)', color: 'var(--brand)', background: 'var(--surface)' }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--brand)'
                  ;(e.currentTarget as HTMLElement).style.color = 'white'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--brand)'
                }}
              >
                {s.n}
              </div>
              <h3 className="font-heading font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ NIMA UCHUN ══════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 100%)' }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="font-heading font-bold text-3xl text-white mb-2 tracking-tight">Nima uchun BronUz?</h2>
            <p style={{ color: 'rgba(255,255,255,.55)' }}>Raqobatchilardan ustun tomonlarimiz</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Zap,       bg: '#FEF3C7', col: '#F59E0B', title: 'Tez va oson',     desc: '3 daqiqada bron qiling — hech qanday ro\'yxatdan o\'tmasdan.' },
              { icon: Shield,    bg: '#D1FAE5', col: '#10B981', title: 'Xavfsiz',          desc: 'Barcha bizneslar tekshirilgan. Shaffof narxlar.' },
              { icon: TrendingUp, bg: '#EDE9FE', col: '#8B5CF6', title: 'Qulay vaqt',      desc: 'Bo\'sh vaqtlarni real ko\'ring. Qarama-qarshi bron yo\'q.' },
              { icon: Star,      bg: '#FEE2E2', col: '#EF4444', title: 'SMS bildirishnoma', desc: 'Bron tasdiqlanganda darhol SMS xabari keladi.' },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-[var(--radius-lg)] p-7 transition-all duration-300 cursor-default animate-fade-up"
                style={{
                  background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.08)',
                  animationDelay: `${i * 0.07}s`,
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,70,229,.4)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'none'
                }}
              >
                <div className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-5"
                  style={{ background: f.bg }}>
                  <f.icon size={20} color={f.col} />
                </div>
                <h3 className="font-heading font-semibold text-base mb-2 text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.5)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div
          className="relative rounded-[var(--radius-xl)] overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8"
          style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)', padding: '56px 56px' }}
        >
          {/* Orbs */}
          <div className="pointer-events-none absolute -right-20 -top-20 w-96 h-96 rounded-full"
            style={{ background: 'rgba(255,255,255,.07)' }} />
          <div className="pointer-events-none absolute right-24 -bottom-28 w-72 h-72 rounded-full"
            style={{ background: 'rgba(255,255,255,.05)' }} />

          <div className="relative z-10">
            <h2 className="font-heading font-bold text-3xl text-white mb-2 tracking-tight">Biznesingizni platformaga<br />qo'shing — bepul!</h2>
            <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '1rem' }}>Mijozlar o'zlari bron qilsin. Telefonlar ko'payishiga chek qo'ying.</p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/business/register"
              className="btn"
              style={{ background: 'white', color: 'var(--brand)', padding: '14px 28px', fontSize: '0.9rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
            >
              Hoziroq boshlash
            </Link>
            <Link
              href="/search"
              className="btn"
              style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,.5)', padding: '14px 28px', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
            >
              Saytni ko'rish
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
