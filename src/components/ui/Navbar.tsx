'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, CalendarDays, LogOut, ChevronDown, LayoutDashboard, Search, Home, Grid3X3 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { href: '/',           label: 'Bosh sahifa',   icon: Home },
  { href: '/categories', label: 'Kategoriyalar', icon: Grid3X3 },
  { href: '/search',     label: 'Qidirish',      icon: Search },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const phone = user?.phone
    ? user.phone.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    : null
  const initial = phone ? phone.replace('+998 ', '')[0] : '?'

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(248,247,255,.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center justify-between gap-4" style={{ height: 64 }}>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              >B</div>
              <span className="font-heading font-bold text-lg">
                <span style={{ color: 'var(--text-primary)' }}>Bron</span>
                <span style={{ color: 'var(--primary)' }}>Uz</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--brand-light)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/business/register"
                className="btn btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 8px rgba(79,70,229,.3)',
                }}
              >
                + Biznes qo'shish
              </Link>

              {loading ? (
                <div className="w-32 h-9 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
              ) : user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                    onMouseEnter={e => {
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--brand-light)'
                    }}
                    onMouseLeave={e => {
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
                      {initial}
                    </div>
                    <span className="text-sm font-medium max-w-[90px] truncate" style={{ color: 'var(--text-primary)' }}>
                      {phone || 'Profil'}
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-12 rounded-2xl p-1.5 min-w-[200px] z-50 animate-scale-in"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}
                    >
                      <div className="px-3 py-2 mb-1">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kirgan:</p>
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{phone}</p>
                      </div>
                      <div className="h-px my-1" style={{ background: 'var(--border-light)' }} />
                      {[
                        { href: '/profile',   icon: CalendarDays,    label: 'Mening bronlarim' },
                        { href: '/dashboard', icon: LayoutDashboard, label: 'Biznes paneli' },
                      ].map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => {
                            ;(e.currentTarget as HTMLElement).style.background = 'var(--brand-light)'
                            ;(e.currentTarget as HTMLElement).style.color = 'var(--brand)'
                          }}
                          onMouseLeave={e => {
                            ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                          }}
                        >
                          <item.icon size={15} style={{ color: 'var(--text-muted)' }} />
                          {item.label}
                        </Link>
                      ))}
                      <div className="h-px my-1" style={{ background: 'var(--border-light)' }} />
                      <button
                        onClick={() => { setDropdownOpen(false); signOut() }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors"
                        style={{ color: 'var(--danger)' }}
                        onMouseEnter={e => { ;(e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
                        onMouseLeave={e => { ;(e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <LogOut size={15} /> Chiqish
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
                  <User size={15} /> Kirish
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden animate-fade-up" style={{ borderTop: '1px solid var(--border-light)', background: 'var(--surface)' }}>
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(link => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? 'var(--brand)' : 'var(--text-primary)',
                      background: isActive ? 'var(--brand-light)' : 'transparent',
                    }}
                  >
                    <Icon size={18} /> {link.label}
                  </Link>
                )
              })}

              <div className="h-px my-2" style={{ background: 'var(--border-light)' }} />

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ background: 'linear-gradient(135deg, var(--brand), var(--accent))' }}>
                      {initial}
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Kirgan</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{phone}</p>
                    </div>
                  </div>
                  {[
                    { href: '/profile',   icon: CalendarDays,    label: 'Mening bronlarim' },
                    { href: '/dashboard', icon: LayoutDashboard, label: 'Biznes paneli' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <item.icon size={18} style={{ color: 'var(--text-muted)' }} /> {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { setMobileOpen(false); signOut() }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                    style={{ color: 'var(--danger)' }}
                  >
                    <LogOut size={18} /> Chiqish
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 btn btn-primary justify-center" style={{ padding: '12px' }}>
                    Kirish
                  </Link>
                  <Link href="/business/register" onClick={() => setMobileOpen(false)}
                    className="flex-1 btn btn-primary justify-center" style={{ padding: '12px' }}>
                    Biznes qo'shish
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden mobile-nav">
        {[
          { href: '/',           icon: Home,        label: 'Bosh' },
          { href: '/categories', icon: Grid3X3,     label: 'Kategoriya' },
          { href: '/search',     icon: Search,      label: 'Qidirish' },
          { href: user ? '/profile' : '/auth/login', icon: user ? CalendarDays : User, label: user ? 'Bronlarim' : 'Kirish' },
        ].map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all"
              style={{ color: isActive ? 'var(--brand)' : 'var(--text-muted)' }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="md:hidden h-16" />
    </>
  )
}
