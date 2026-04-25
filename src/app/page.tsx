'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Star, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react'

const CATEGORIES = [
  { slug: 'sartarosh',  name_uz: 'Sartaroshxona', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=150&h=150&fit=crop', color: '#EF4444', count: 5, rating: 4.8, desc: 'Real-time navbat tizimi bilan professional usta xizmatlaridan foydalaning.' },
  { slug: 'mehmonxona', name_uz: 'Mehmonxona',    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&h=150&fit=crop', color: '#F59E0B', count: 5, rating: 4.7, desc: 'Qulay xonalarni onlayn bron qiling va barcha xizmatlarni boshqaring.' },
  { slug: 'sport',      name_uz: 'Sport Maydonlari', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop', color: '#0EA5E9', count: 5, rating: 4.8, desc: 'Yaqin atrofdagi bo\'sh vaqtlarni toping va darhol bron qiling.' },
  { slug: 'dacha',      name_uz: 'Dachalar',      image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=150&h=150&fit=crop', color: '#8B5CF6', count: 3, rating: 4.6, desc: 'Eng yaxshi dacha va dam olish maskanlarini BronUz orqali toping.' },
  { slug: 'taksi',      name_uz: 'Taksi (Rizo.uz)', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=150&h=150&fit=crop', color: '#EC4899', count: 0, rating: null, desc: 'Rizo.uz orqali istalgan manzilga qulay va xavfsiz taksi xizmatini...' },
  { slug: 'choyxona',   name_uz: 'Choyxonalar',   image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&h=150&fit=crop', color: '#10B981', count: 3, rating: 4.8, desc: 'Do\'stlar bilan o\'tirish uchun eng yaxshi choyxonalarni band qiling.' },
  { slug: 'history',    name_uz: 'Bronlar tarixi',image: 'https://images.unsplash.com/photo-1506784951206-3962de14763e?w=150&h=150&fit=crop', color: '#64748B', count: 0, rating: null, desc: 'Oldingi xizmatlar va sevimli ustalaringizni bir joyda toping.' },
  { slug: 'add',        name_uz: 'Biznesingizni qo\'shing', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop', color: '#7C3AED', count: 0, rating: null, desc: 'Platformamizga qo\'shiling va yangi mijozlarga yeting.', isAction: true },
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
          paddingTop: 120,
        }}
      >
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,.07) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,.05) 0%, transparent 70%)' }} />

        <div className="w-full px-[80px] max-lg:px-[40px] max-md:px-[20px] pb-[80px] grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-[8px] px-[14px] py-[6px] rounded-[100px] mb-[24px] text-[13px] font-semibold animate-fade-up"
              style={{ background: '#EEF2FF', border: '1px solid rgba(79,70,229,.2)', color: '#4F46E5' }}>
              <span className="w-[6px] h-[6px] rounded-full animate-pulse block" style={{ background: '#4F46E5' }} />
              Toshkentning birinchi Super App platformasi
            </div>

            <h1 className="font-heading font-extrabold leading-[1.1] tracking-[-1.5px] mb-[20px] animate-fade-up delay-100"
              style={{ fontSize: '62px', color: 'var(--text-primary)' }}>
              Barcha xizmatlar<br />
              <span style={{ color: '#4F46E5' }}>bir joyda.</span>
            </h1>

            <p className="mb-[36px] leading-[1.7] animate-fade-up delay-200"
              style={{ fontSize: '17px', color: 'var(--text-secondary)', maxWidth: 480 }}>
              Sartaroshxonadan mehmonxonagacha — real-time navbat va onlayn bron tizimi orqali vaqtingizni tejang. Bir platforma, barcha imkoniyatlar.
            </p>

            <div className="flex flex-wrap gap-[14px] mb-[52px] items-center animate-fade-up delay-200">
              <Link
                href="/search"
                className="px-[28px] py-[14px] rounded-[12px] flex items-center gap-[8px] transition-all text-white text-[15px] font-semibold border-none shadow-[0_4px_20px_rgba(79,70,229,0.35)] hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(79,70,229,0.45)]"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
              >
                Xizmatlarni ko'rish →
              </Link>
              <Link
                href="/business/register"
                className="px-[28px] py-[14px] rounded-[12px] flex items-center gap-[8px] transition-all text-[15px] font-semibold border-[1.5px] border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                Biznes ro'yxatdan o'tish
              </Link>
            </div>

            <div className="flex gap-[32px] animate-fade-up delay-300">
              {[
                { num: '10k+', label: 'Foydalanuvchi' },
                { num: '500+', label: 'Xizmat ko\'rsatuvchi' },
                { num: '4.9 ⭐', label: 'O\'rtacha reyting' },
              ].map(s => (
                <div key={s.label}>
                  <div className="font-heading font-bold text-[28px]" style={{ color: 'var(--text-primary)' }}>{s.num}</div>
                  <div className="text-[13px] mt-[2px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — booking card */}
          <div className="relative hidden lg:block animate-fade-up delay-200" style={{ zIndex: 10 }}>
            {/* Float top-right */}
            <div className="animate-float absolute -top-[20px] -right-[20px] flex items-center gap-[10px] px-[16px] py-[12px] rounded-[12px] bg-[var(--surface)] border border-[var(--border-light)] shadow-[0_4px_16px_rgba(79,70,229,.08),0_2px_6px_rgba(0,0,0,.04)] z-20">
              <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[18px] bg-[#D1FAE5]">✅</div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">Bron holati</div>
                <div className="text-[14px] font-bold font-heading text-[var(--text-primary)]">Tasdiqlandi</div>
              </div>
            </div>

            {/* Main card */}
            <div className="relative bg-[var(--surface)] rounded-[28px] p-[28px] border border-[var(--border-light)] shadow-[0_20px_48px_rgba(79,70,229,.14),0_8px_20px_rgba(0,0,0,.06)] overflow-hidden z-10">
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #4F46E5, #7C3AED)' }} />

              <div className="flex items-center gap-[12px] mb-[24px]">
                <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center font-bold text-white text-[16px] font-heading"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>B</div>
                <div>
                  <h4 className="font-semibold text-[15px] leading-tight" style={{ color: 'var(--text-primary)' }}>Bugun uchun bron qiling</h4>
                  <p className="text-[12px] font-medium flex items-center gap-[5px]" style={{ color: '#10B981', marginTop: '2px' }}>
                    <span className="w-[7px] h-[7px] rounded-full bg-[#10B981] inline-block" />
                    Real-time navbat
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[10px] mb-[16px]">
                {[
                  { icon: '✂️', name: 'Sartaroshxona',  slots: '5 ta joy' },
                  { icon: '🏨', name: 'Mehmonxona', slots: '5 ta joy' },
                  { icon: '🏟️', name: 'Sport maydoni', slots: '3 ta joy' },
                  { icon: '🍵', name: 'Choyxona',      slots: '8 ta joy' },
                ].map(s => (
                  <div key={s.name}
                    className="rounded-[12px] p-[16px] border border-[var(--border-light)] bg-[var(--bg)] transition-all duration-200 cursor-pointer hover:border-[#4F46E5] hover:bg-[#EEF2FF] hover:-translate-y-[2px]">
                    <div className="text-[22px] mb-[8px]">{s.icon}</div>
                    <div className="text-[13px] font-semibold text-[var(--text-primary)]">{s.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-[2px]">{s.slots}</div>
                  </div>
                ))}
              </div>

              <Link href="/search"
                className="w-full flex items-center justify-center p-[13px] rounded-[12px] border-none text-white font-semibold text-[15px] font-heading transition-all hover:shadow-[0_6px_20px_rgba(79,70,229,.4)]"
                style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                Bron qilish →
              </Link>
            </div>

            {/* Float bottom-left */}
            <div className="animate-float absolute -bottom-[20px] -left-[20px] flex items-center gap-[10px] px-[16px] py-[12px] rounded-[12px] bg-[var(--surface)] border border-[var(--border-light)] shadow-[0_4px_16px_rgba(79,70,229,.08),0_2px_6px_rgba(0,0,0,.04)] z-20"
              style={{ animationDelay: '1s' }}>
              <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[18px] bg-[#FEF3C7]">⭐</div>
              <div>
                <div className="text-[11px] text-[var(--text-muted)]">O'rtacha reyting</div>
                <div className="text-[14px] font-bold font-heading text-[var(--text-primary)]">4.9 / 5.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="w-full px-[80px] max-lg:px-[40px] max-md:px-[20px] pb-[60px]">
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
      <section className="py-[60px] px-[80px] max-lg:px-[40px] max-md:px-[20px] w-full">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const href = cat.slug === 'history' ? '/profile' : cat.slug === 'add' ? '/business/register' : `/categories/${cat.slug}`
            return (
            <Link
              key={cat.slug}
              href={href}
              className="group relative overflow-hidden animate-fade-up bg-white rounded-[20px] p-6 transition-all duration-300 border border-slate-100 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(79,70,229,0.08)] hover:border-transparent flex flex-col h-full"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${cat.color}, transparent)` }} />

              {/* Image Wrap */}
              <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center mb-4 overflow-hidden shadow-sm border border-slate-50 shrink-0">
                <img src={cat.image} alt={cat.name_uz} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>

              <h3 className="font-bold text-[17px] mb-2 font-heading" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                {cat.name_uz}
              </h3>
              
              <p className="text-[13px] leading-[1.6] mb-6 text-slate-500">
                {cat.desc}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                  {cat.isAction ? '🚀 Bepul boshlash' : <><span className="text-slate-400">👥</span> {cat.count} ta joy</>}
                </div>
                <div className="flex items-center gap-3">
                  {cat.rating && (
                    <div className="flex items-center gap-1 text-[12px] font-bold text-amber-500">
                      ⭐ {cat.rating}
                    </div>
                  )}
                  {cat.rating === null && !cat.isAction && (
                    <div className="flex items-center gap-1 text-[12px] font-bold text-amber-500">
                      ⭐ —
                    </div>
                  )}
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-slate-400 transition-all duration-300 group-hover:text-white ${cat.slug === 'history' ? 'bg-indigo-600 text-white' : 'bg-slate-50 group-hover:bg-indigo-600'}`}>
                    <ArrowRight size={14} className={cat.slug !== 'history' ? 'group-hover:translate-x-0.5 transition-transform' : ''} />
                  </div>
                </div>
              </div>
            </Link>
          )})}
        </div>
      </section>

      {/* ══════════ MASHHUR JOYLAR ══════════ */}
      <section className="py-[60px] px-[80px] max-lg:px-[40px] max-md:px-[20px] w-full" style={{ background: 'var(--surface-2)' }}>
        <div className="w-full">
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
      <section className="py-[60px] px-[80px] max-lg:px-[40px] max-md:px-[20px] w-full">
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
      <section style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 100%)' }} className="py-[80px] px-[80px] max-lg:px-[40px] max-md:px-[20px] w-full">
        <div className="w-full">
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
      <section className="py-[0px] px-[80px] max-lg:px-[40px] max-md:px-[20px] pb-[80px] w-full">
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
