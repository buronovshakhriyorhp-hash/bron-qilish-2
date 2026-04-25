'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, ChevronLeft, Loader2, AlertCircle, MessageSquare, BarChart2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

export default function BusinessRegisterPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '',
    category: '',
    phone: '+998',
    address: '',
    description: '',
    instagram: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories(data || []))
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name || form.name.length < 2) e.name = 'Kamida 2 harf'
    if (!form.category) e.category = 'Kategoriya tanlang'
    if (!/^\+998\d{9}$/.test(form.phone)) e.phone = 'Format: +998XXXXXXXXX'
    if (!form.address || form.address.length < 5) e.address = 'Kamida 5 harf'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setServerError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/business-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          phone: form.phone,
          address: form.address,
          description: form.description,
          instagram: form.instagram || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error || 'Xatolik yuz berdi')
      } else {
        setSubmitted(true)
      }
    } catch {
      setServerError('Tarmoq xatosi. Internet aloqasini tekshiring.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div
          className="animate-scale-in"
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '52px 44px',
            maxWidth: 480,
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: 84, height: 84,
            background: '#D1FAE5',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={40} color="#10B981" />
          </div>
          <h1
            className="font-heading"
            style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.03em' }}
          >
            Ariza yuborildi!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 36 }}>
            Adminlar 24 soat ichida arizangizni ko'rib chiqadi va
            biznesingizni platformaga qo'shadi.
          </p>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* blobs */}
        <div style={{ position: 'absolute', top: -80, left: '20%', width: 420, height: 420, background: 'rgba(79,70,229,.12)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: '15%', width: 320, height: 320, background: 'rgba(124,58,237,.1)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 52px', position: 'relative' }}>
          <Link
            href="/"
            className="animate-fade-up"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.45)', fontSize: '0.875rem', marginBottom: 32, transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.8)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,.45)' }}
          >
            <ChevronLeft size={16} /> Orqaga
          </Link>

          <h1
            className="font-heading animate-fade-up delay-100"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '-0.04em', lineHeight: 1.1 }}
          >
            Biznesingizni BronUz ga<br />
            <span style={{ background: 'linear-gradient(135deg, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              qo'shing — bepul!
            </span>
          </h1>
          <p
            className="animate-fade-up delay-200"
            style={{ color: 'rgba(255,255,255,.5)', fontSize: '1rem', marginBottom: 32, maxWidth: 480 }}
          >
            Telefon qo'ng'iroqlarini kamaytiring, mijozlar o'zlari bron qilsin
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-3 animate-fade-up delay-300">
            {[
              { icon: <MessageSquare size={14} />, label: 'SMS bildirishnoma' },
              { icon: <BarChart2 size={14} />, label: 'Bron statistikasi' },
              { icon: <Star size={14} />, label: 'Reyting tizimi' },
            ].map(f => (
              <div
                key={f.label}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(255,255,255,.12)',
                  color: 'rgba(255,255,255,.75)',
                  fontSize: '0.8rem', fontWeight: 500,
                }}
              >
                {f.icon} {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              padding: '40px',
              border: '1px solid var(--border-light)',
            }}
          >

            {/* Server error */}
            {serverError && (
              <div
                className="animate-fade-up"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '0.875rem',
                  marginBottom: 28,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {serverError}
              </div>
            )}

            {/* ── SECTION 1: Asosiy ma'lumotlar ── */}
            <SectionLabel>Asosiy ma'lumotlar</SectionLabel>

            <FieldRow error={errors.name}>
              <FieldLabel required>Biznes nomi</FieldLabel>
              <input
                type="text"
                placeholder="Masalan: Samarqand Restoran"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input"
                style={errors.name ? { borderColor: 'var(--danger)', background: '#FEF9F9' } : {}}
              />
            </FieldRow>

            <FieldRow error={errors.phone}>
              <FieldLabel required>Telefon raqam</FieldLabel>
              <input
                type="tel"
                placeholder="+998901234567"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input"
                style={errors.phone ? { borderColor: 'var(--danger)', background: '#FEF9F9' } : {}}
              />
            </FieldRow>

            <FieldRow error={errors.address} last>
              <FieldLabel required>Manzil</FieldLabel>
              <input
                type="text"
                placeholder="Tuman, ko'cha, uy raqami"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="input"
                style={errors.address ? { borderColor: 'var(--danger)', background: '#FEF9F9' } : {}}
              />
            </FieldRow>

            <Divider />

            {/* ── SECTION 2: Kategoriya ── */}
            <SectionLabel>Kategoriya <RequiredDot /></SectionLabel>

            {categories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 8 }}>
                {categories.map(cat => {
                  const isSelected = form.category === cat.slug
                  return (
                    <button
                      type="button"
                      key={cat.slug}
                      onClick={() => setForm({ ...form, category: cat.slug })}
                      style={{
                        padding: '14px 8px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--brand-light)' : 'var(--surface)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          const el = e.currentTarget as HTMLElement
                          el.style.borderColor = 'var(--brand)'
                          el.style.background = 'var(--brand-light)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          const el = e.currentTarget as HTMLElement
                          el.style.borderColor = 'var(--border)'
                          el.style.background = 'var(--surface)'
                        }
                      }}
                    >
                      <div style={{ fontSize: '1.6rem', marginBottom: 7 }}>{cat.icon || '🏢'}</div>
                      <div style={{ fontSize: '0.73rem', fontWeight: 600, color: isSelected ? 'var(--brand)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {cat.name_uz}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div style={{ height: 108, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', marginBottom: 8 }} className="animate-pulse" />
            )}
            {errors.category && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, marginBottom: 20 }}>{errors.category}</p>}

            <Divider />

            {/* ── SECTION 3: Qo'shimcha ── */}
            <SectionLabel>Qo'shimcha ma'lumotlar</SectionLabel>

            <FieldRow>
              <FieldLabel>Biznes haqida qisqacha</FieldLabel>
              <textarea
                rows={3}
                placeholder="Biznesingiz haqida qisqacha ma'lumot..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input"
                style={{ resize: 'none', minHeight: 92 }}
              />
            </FieldRow>

            <FieldRow last>
              <FieldLabel>Instagram <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(ixtiyoriy)</span></FieldLabel>
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '12px 14px',
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--border)',
                    borderRight: 'none',
                    borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >@</span>
                <input
                  type="text"
                  placeholder="biznesingiz_nomi"
                  value={form.instagram}
                  onChange={e => setForm({ ...form, instagram: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    color: 'var(--text-primary)',
                    background: 'var(--bg)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand)' }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                />
              </div>
            </FieldRow>

            {/* ── SUBMIT ── */}
            <button
              type="submit"
              disabled={submitting}
              className="font-heading"
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: submitting ? 'var(--surface-2)' : 'linear-gradient(135deg, var(--brand), var(--accent))',
                color: submitting ? 'var(--text-muted)' : 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: submitting ? 'none' : '0 2px 8px rgba(79,70,229,.3)',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-sora, Sora)',
              }}
              onMouseEnter={e => {
                if (!submitting) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'none'
              }}
            >
              {submitting
                ? <><Loader2 size={18} className="animate-spin" /> Yuborilmoqda...</>
                : 'Ariza yuborish →'
              }
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 14 }}>
              Bepul ro'yxatdan o'tish. Komissiya faqat muvaffaqiyatli bronlar uchun.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Helpers ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-heading"
      style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 16 }}
    >
      {children}
    </p>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 7 }}>
      {children}
      {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
    </label>
  )
}

function RequiredDot() {
  return <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>
}

function FieldRow({ children, error, last }: { children: React.ReactNode; error?: string; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 24 : 16 }}>
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--border-light)', margin: '28px 0' }} />
}
