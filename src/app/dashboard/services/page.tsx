'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getOwnerBusinesses, getBusinessServices, upsertService, deleteService } from '@/lib/db/queries'
import type { Business, Service } from '@/types'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Loader2, Clock, Tag, X, Check } from 'lucide-react'

interface ServiceForm {
  id?: string
  name: string
  description: string
  duration_minutes: number
  price_min: string
  price_max: string
  price_label: string
}

const emptyForm: ServiceForm = {
  name: '', description: '', duration_minutes: 60,
  price_min: '', price_max: '', price_label: '',
}

export default function DashboardServicesPage() {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBizId, setSelectedBizId] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getOwnerBusinesses(user.id).then(list => {
      setBusinesses(list)
      if (list.length > 0) setSelectedBizId(list[0].id)
      else setLoading(false)
    })
  }, [user])

  useEffect(() => {
    if (!selectedBizId) return
    setLoading(true)
    getBusinessServices(selectedBizId).then(data => {
      setServices(data)
      setLoading(false)
    })
  }, [selectedBizId])

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!form.name) { toast.error('Xizmat nomini kiriting'); return }
    if (!selectedBizId) return
    setSaving(true)
    const ok = await upsertService({
      ...(form.id ? { id: form.id } : {}),
      business_id: selectedBizId,
      name: form.name,
      description: form.description || undefined,
      duration_minutes: form.duration_minutes,
      price_min: form.price_min ? parseFloat(form.price_min) : undefined,
      price_max: form.price_max ? parseFloat(form.price_max) : undefined,
      price_label: form.price_label || undefined,
      is_active: true,
      sort_order: form.id ? (services.find(s => s.id === form.id)?.sort_order || 0) : services.length,
    })
    if (ok) {
      toast.success(form.id ? 'Xizmat yangilandi' : 'Xizmat qo\'shildi')
      setShowForm(false)
      setForm(emptyForm)
      const data = await getBusinessServices(selectedBizId)
      setServices(data)
    } else {
      toast.error('Xatolik yuz berdi')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Xizmatni o\'chirasizmi?')) return
    setDeletingId(id)
    const ok = await deleteService(id)
    if (ok) {
      setServices(prev => prev.filter(s => s.id !== id))
      toast.success('Xizmat o\'chirildi')
    } else {
      toast.error('Xatolik yuz berdi')
    }
    setDeletingId(null)
  }

  const handleEdit = (service: Service) => {
    setForm({
      id: service.id,
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price_min: service.price_min?.toString() || '',
      price_max: service.price_max?.toString() || '',
      price_label: service.price_label || '',
    })
    setShowForm(true)
  }

  const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Xizmatlar</h1>
          <p className="text-slate-500 text-sm mt-1">Xizmatlaringizni boshqaring</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Xizmat qo'shish
        </button>
      </div>

      {/* Biznes tanlash */}
      {businesses.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {businesses.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBizId(b.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedBizId === b.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Xizmat qo'shish/tahrirlash formasi */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">{form.id ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}</h3>
            <button onClick={() => { setShowForm(false); setForm(emptyForm) }} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Xizmat nomi *</label>
              <input className={inputClass} placeholder="Masalan: Soch qirqish" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tavsif (ixtiyoriy)</label>
              <input className={inputClass} placeholder="Qisqa tavsif" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1"><Clock size={11} className="inline" /> Davomiyligi (daqiqa)</label>
                <input type="number" className={inputClass} value={form.duration_minutes} onChange={e => set('duration_minutes', parseInt(e.target.value) || 60)} min={5} max={480} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1"><Tag size={11} className="inline" /> Min narx (so'm)</label>
                <input type="number" className={inputClass} placeholder="50000" value={form.price_min} onChange={e => set('price_min', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Max narx (so'm)</label>
                <input type="number" className={inputClass} placeholder="100000" value={form.price_max} onChange={e => set('price_max', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Narx matni (ixtiyoriy)</label>
              <input className={inputClass} placeholder="Masalan: 50,000 — 100,000 so'm" value={form.price_label} onChange={e => set('price_label', e.target.value)} />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Saqlash
              </button>
              <button onClick={() => { setShowForm(false); setForm(emptyForm) }} className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Xizmatlar ro'yxati */}
      {businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">✂️</div>
          <p className="text-slate-500">Avval biznes qo'shing</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-blue-500" />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="text-4xl mb-3">✂️</div>
          <h3 className="font-semibold text-slate-700 mb-2">Hali xizmatlar yo'q</h3>
          <p className="text-slate-400 text-sm mb-4">Birinchi xizmatingizni qo'shing</p>
          <button onClick={() => { setForm(emptyForm); setShowForm(true) }} className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Xizmat qo'shish
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 text-sm">{service.name}</h3>
                  {!service.is_active && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Faolsizlashtirilgan</span>
                  )}
                </div>
                {service.description && (
                  <p className="text-xs text-slate-400 mb-1.5">{service.description}</p>
                )}
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={11} /> {service.duration_minutes} daqiqa</span>
                  {service.price_label && (
                    <span className="flex items-center gap-1"><Tag size={11} /> {service.price_label}</span>
                  )}
                  {!service.price_label && service.price_min && (
                    <span className="flex items-center gap-1">
                      <Tag size={11} />
                      {service.price_min?.toLocaleString()}
                      {service.price_max ? ` — ${service.price_max?.toLocaleString()}` : ''} so'm
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Tahrirlash"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="O'chirish"
                >
                  {deletingId === service.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
