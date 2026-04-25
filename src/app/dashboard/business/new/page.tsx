'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getCategories } from '@/lib/db/queries'
import { createBusiness } from '@/lib/db/queries'
import type { Category } from '@/types'
import toast from 'react-hot-toast'
import { Building2, Phone, MapPin, Clock, Image, ChevronRight, Loader2 } from 'lucide-react'

const DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
const DISTRICTS = ['Yunusobod', 'Chilonzor', 'Mirzo Ulug\'bek', 'Shayxontohur', 'Yakkasaroy',
  'Hamza', 'Uchtepa', 'Bektemir', 'Sergeli', 'Olmazor', 'Mirobod', 'Almazar']

const defaultHours = DAYS.map((_, i) => ({
  dayOfWeek: i,
  isOpen: i !== 0, // Yakshanba yopiq
  openTime: '09:00',
  closeTime: '18:00',
}))

export default function NewBusinessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    shortDescription: '',
    address: '',
    district: '',
    city: 'Toshkent',
    phone: '+998',
    phone2: '',
    instagram: '',
    telegram: '',
    coverImage: '',
  })
  const [hours, setHours] = useState(defaultHours)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleDay = (i: number) =>
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, isOpen: !h.isOpen } : h))

  const updateHour = (i: number, field: 'openTime' | 'closeTime', value: string) =>
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: value } : h))

  const handleSubmit = async () => {
    if (!user) return
    if (!form.name || !form.categoryId || !form.phone || !form.address) {
      toast.error('Majburiy maydonlarni to\'ldiring')
      return
    }
    setLoading(true)
    try {
      const id = await createBusiness({
        name: form.name,
        categoryId: form.categoryId,
        description: form.description,
        shortDescription: form.shortDescription,
        address: form.address,
        district: form.district,
        city: form.city,
        phone: form.phone,
        phone2: form.phone2 || undefined,
        instagram: form.instagram || undefined,
        telegram: form.telegram || undefined,
        coverImage: form.coverImage || undefined,
        hours,
      }, user.id)

      if (id) {
        toast.success('Biznes muvaffaqiyatli qo\'shildi!')
        router.push('/dashboard')
      } else {
        toast.error('Xatolik yuz berdi')
      }
    } catch (e) {
      toast.error('Xatolik yuz berdi')
    }
    setLoading(false)
  }

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Yangi biznes qo'shish</h1>
        <p className="text-slate-500 text-sm mt-1">Ma'lumotlarni to'ldiring — 3 qadam</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s)}
              className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-colors ${
                step === s ? 'bg-blue-600 text-white' :
                step > s ? 'bg-green-500 text-white' :
                'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s ? '✓' : s}
            </button>
            {s < 3 && <div className={`h-0.5 w-12 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-slate-500">
          {step === 1 ? 'Asosiy ma\'lumotlar' : step === 2 ? 'Manzil & Aloqa' : 'Ish soatlari'}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">

        {/* QADAM 1: Asosiy ma'lumotlar */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Biznes nomi *</label>
              <input className={inputClass} placeholder="Masalan: Silk Road Salon" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Kategoriya *</label>
              <select className={inputClass} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
                <option value="">— Tanlang —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name_uz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Qisqa tavsif (ixtiyoriy)</label>
              <input className={inputClass} placeholder="1-2 qator tavsif" value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>To'liq tavsif</label>
              <textarea
                className={inputClass}
                rows={4}
                placeholder="Xizmatlaringiz, ustalaringiz, afzalliklaringiz haqida yozing..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1"><Image size={14} /> Muqova rasm URL (ixtiyoriy)</span>
              </label>
              <input className={inputClass} placeholder="https://..." value={form.coverImage} onChange={e => set('coverImage', e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Unsplash.com dan bepul rasm URL ni ishlating</p>
            </div>
          </div>
        )}

        {/* QADAM 2: Manzil & Aloqa */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}><MapPin size={14} className="inline mr-1" />Manzil *</label>
              <input className={inputClass} placeholder="Ko'cha nomi, uy raqami" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tuman</label>
                <select className={inputClass} value={form.district} onChange={e => set('district', e.target.value)}>
                  <option value="">— Tanlang —</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Shahar</label>
                <input className={inputClass} value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelClass}><Phone size={14} className="inline mr-1" />Telefon *</label>
              <input className={inputClass} placeholder="+998901234567" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            <div>
              <label className={labelClass}>Qo'shimcha telefon (ixtiyoriy)</label>
              <input className={inputClass} placeholder="+998901234567" value={form.phone2} onChange={e => set('phone2', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Instagram</label>
                <input className={inputClass} placeholder="@username" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Telegram</label>
                <input className={inputClass} placeholder="@username" value={form.telegram} onChange={e => set('telegram', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* QADAM 3: Ish soatlari */}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4"><Clock size={14} className="inline mr-1" />Har kun uchun ish vaqtini belgilang</p>
            {hours.map((h, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${h.isOpen ? 'border-blue-100 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                <button
                  onClick={() => toggleDay(i)}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${h.isOpen ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${h.isOpen ? 'left-5' : 'left-1'}`} />
                </button>
                <span className="text-sm font-medium w-24 text-slate-700">{DAYS[i]}</span>
                {h.isOpen ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={h.openTime}
                      onChange={e => updateHour(i, 'openTime', e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-sm"
                    />
                    <span className="text-slate-400 text-sm">—</span>
                    <input
                      type="time"
                      value={h.closeTime}
                      onChange={e => updateHour(i, 'closeTime', e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1 text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">Yopiq</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              ← Orqaga
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !form.name) { toast.error('Biznes nomini kiriting'); return }
                if (step === 1 && !form.categoryId) { toast.error('Kategoriya tanlang'); return }
                if (step === 2 && !form.phone) { toast.error('Telefon raqamini kiriting'); return }
                if (step === 2 && !form.address) { toast.error('Manzilni kiriting'); return }
                setStep(s => s + 1)
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Keyingisi <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : '✓'} Biznesni saqlash
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
