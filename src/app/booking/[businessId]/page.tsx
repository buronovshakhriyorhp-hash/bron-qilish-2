'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft, Clock, User, CheckCircle, Phone,
  Loader2, MapPin, CalendarDays, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createBooking, getBookedSlots } from '@/lib/db/queries'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// Barcha vaqt bo'limlari
const ALL_TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','13:00','13:30','14:00','14:30','15:00',
  '15:30','16:00','16:30','17:00','17:30','18:00',
  '18:30','19:00','19:30','20:00','20:30','21:00',
]

const UZ_DAYS   = ['Yak','Dush','Sesh','Chor','Pay','Jum','Shan']
const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

function getUpcomingDays(count = 14): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

type Step = 1 | 2 | 3 | 4

interface BusinessInfo {
  id: string
  name: string
  services: { id: string; name: string; duration_minutes: number; price_label?: string }[]
  staff: { id: string; name: string; specialization?: string; avatar?: string }[]
}

const STEP_LABELS = ['Xizmat', 'Sana & Vaqt', 'Ma\'lumot']

export default function BookingPage({
  params,
  searchParams,
}: {
  params: { businessId: string }
  searchParams: { service?: string }
}) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(1)
  const [business, setBusiness] = useState<BusinessInfo | null>(null)
  const [loadingBusiness, setLoadingBusiness] = useState(true)

  const [selectedService, setSelectedService] = useState(searchParams.service || '')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    phone: user?.phone ? user.phone.replace('+998', '') : '',
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const days = getUpcomingDays()

  // Biznes ma'lumotlarini yuklash
  useEffect(() => {
    async function load() {
      setLoadingBusiness(true)
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id, name,
          services(id, name, duration_minutes, price_label, is_active, sort_order),
          staff(id, name, specialization, avatar, is_active)
        `)
        .eq('id', params.businessId)
        .single()

      if (!error && data) {
        setBusiness({
          ...data,
          services: (data.services || []).filter((s: any) => s.is_active).sort((a: any, b: any) => a.sort_order - b.sort_order),
          staff: (data.staff || []).filter((s: any) => s.is_active),
        })
      }
      setLoadingBusiness(false)
    }
    load()
  }, [params.businessId])

  // User ma'lumotlari bilan formni to'ldirish
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || '',
        phone: prev.phone || (user.phone ? user.phone.replace('+998', '') : ''),
      }))
    }
  }, [user])

  // Sana tanlanganda band vaqtlarni yuklash
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSelectedTime('')
    getBookedSlots(params.businessId, formatDate(selectedDate), selectedStaff || undefined)
      .then(slots => setBookedSlots(slots))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, selectedStaff, params.businessId])

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !form.name || !form.phone) {
      toast.error("Barcha majburiy maydonlarni to'ldiring")
      return
    }
    setSubmitting(true)
    try {
      const result = await createBooking({
        businessId: params.businessId,
        serviceId: selectedService || undefined,
        staffId: selectedStaff || undefined,
        date: formatDate(selectedDate),
        time: selectedTime,
        customerName: form.name,
        customerPhone: `+998${form.phone.replace(/\D/g, '')}`,
        customerNote: form.note || undefined,
      })

      if (!result) throw new Error('Bron saqlashda xatolik')
      setBookingId(result.id)
      setStep(4)
      toast.success('Bron muvaffaqiyatli saqlandi!')
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi. Qayta urinib ko\'ring.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===== YUKLANMOQDA =====
  if (loadingBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Yuklanmoqda...</p>
      </div>
    )
  }

  // ===== STEP 4: MUVAFFAQIYAT =====
  if (step === 4) {
    const svc = business?.services.find(s => s.id === selectedService)
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        {/* Confetti dots */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-3xl">
            <span className="absolute -top-2 -left-4 animate-bounce" style={{ animationDelay: '0ms' }}>🎊</span>
            <span className="absolute -top-4 right-0 animate-bounce" style={{ animationDelay: '150ms' }}>✨</span>
            <span className="absolute top-6 -right-6 animate-bounce" style={{ animationDelay: '300ms' }}>🎉</span>
            <span className="absolute top-4 -left-8 animate-bounce" style={{ animationDelay: '200ms' }}>🌟</span>
          </div>

          {/* Success circle */}
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200 animate-scale-in">
            <CheckCircle size={44} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Bron tasdiqlandi!</h1>
        <p className="text-slate-500 text-sm mb-2">Tasdiqlash SMS tez orada yuboriladi</p>

        {/* Bron raqami */}
        <div className="inline-flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 mb-8">
          <span className="text-xs text-slate-500">Bron raqami:</span>
          <span className="font-mono font-bold text-slate-800 tracking-wider">
            #{bookingId?.slice(0,8).toUpperCase()}
          </span>
        </div>

        {/* Tafsilotlar */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3">
            <p className="text-white/90 text-xs font-medium uppercase tracking-wider">Bron tafsilotlari</p>
          </div>
          <div className="divide-y divide-slate-50">
            {business && (
              <div className="flex justify-between items-center px-5 py-3.5">
                <span className="text-slate-400 text-sm flex items-center gap-1.5"><MapPin size={13} />Joy</span>
                <span className="font-semibold text-slate-800 text-sm">{business.name}</span>
              </div>
            )}
            {svc && (
              <div className="flex justify-between items-center px-5 py-3.5">
                <span className="text-slate-400 text-sm flex items-center gap-1.5"><Sparkles size={13} />Xizmat</span>
                <span className="font-semibold text-slate-800 text-sm">{svc.name}</span>
              </div>
            )}
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-slate-400 text-sm flex items-center gap-1.5"><CalendarDays size={13} />Sana</span>
              <span className="font-semibold text-slate-800 text-sm">
                {selectedDate?.getDate()} {UZ_MONTHS[selectedDate?.getMonth() ?? 0]}
              </span>
            </div>
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-slate-400 text-sm flex items-center gap-1.5"><Clock size={13} />Vaqt</span>
              <span className="font-bold text-blue-600 text-sm">{selectedTime}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-slate-400 text-sm flex items-center gap-1.5"><Phone size={13} />Telefon</span>
              <span className="font-semibold text-slate-800 text-sm">+998{form.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 border-2 border-slate-200 py-3.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
          >
            Bosh sahifa
          </Link>
          <Link
            href="/profile"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity text-center shadow-lg shadow-blue-200"
          >
            Bronlarim →
          </Link>
        </div>
      </div>
    )
  }

  // ===== ASOSIY LAYOUT (STEP 1-3) =====
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => step > 1 ? setStep((step - 1) as Step) : router.back()}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
            >
              <ChevronLeft size={20} className="text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-slate-800 text-base leading-tight">Bron qilish</h1>
              <p className="text-xs text-slate-400 truncate">{business?.name || 'Yuklanmoqda...'}</p>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full flex-shrink-0">
              {step}/3
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((label, idx) => {
              const s = idx + 1
              const active = s === step
              const done = s < step
              return (
                <div key={s} className="flex-1 flex flex-col gap-1">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                    done ? 'bg-blue-600' : active ? 'bg-blue-400' : 'bg-slate-200'
                  }`} />
                  <span className={`text-[10px] text-center font-medium transition-colors ${
                    active ? 'text-blue-600' : done ? 'text-blue-400' : 'text-slate-300'
                  }`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-6">

        {/* ===== STEP 1: Xizmat va usta ===== */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            {/* Xizmat tanlash */}
            {business?.services && business.services.length > 0 && (
              <div>
                <h2 className="font-bold text-slate-800 text-lg mb-3">Xizmatni tanlang</h2>
                <div className="space-y-2.5">
                  {business.services.map((svc, idx) => {
                    const isSelected = selectedService === svc.id
                    return (
                      <button
                        key={svc.id}
                        onClick={() => setSelectedService(svc.id)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                        } delay-${idx < 4 ? idx * 100 : 0}`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          {/* Left accent bar */}
                          <div className={`w-1 self-stretch rounded-full transition-colors ${
                            isSelected ? 'bg-blue-500' : 'bg-slate-100 group-hover:bg-slate-200'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-sm transition-colors ${
                              isSelected ? 'text-blue-700' : 'text-slate-800'
                            }`}>
                              {svc.name}
                            </div>
                            <div className={`text-xs flex items-center gap-1 mt-1 transition-colors ${
                              isSelected ? 'text-blue-400' : 'text-slate-400'
                            }`}>
                              <Clock size={11} />
                              <span>{svc.duration_minutes} daqiqa</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                            {svc.price_label && (
                              <div className={`text-sm font-bold transition-colors ${
                                isSelected ? 'text-blue-600' : 'text-slate-700'
                              }`}>
                                {svc.price_label}
                              </div>
                            )}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-slate-200 group-hover:border-slate-300'
                            }`}>
                              {isSelected && <CheckCircle size={14} className="text-white fill-white" strokeWidth={3} />}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Usta tanlash */}
            {business?.staff && business.staff.length > 0 && (
              <div>
                <h2 className="font-bold text-slate-800 text-lg mb-3">Usta tanlang</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Istalgan usta */}
                  <button
                    onClick={() => setSelectedStaff('')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[80px] transition-all border-2 flex-shrink-0 ${
                      selectedStaff === ''
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors ${
                      selectedStaff === '' ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      🎯
                    </div>
                    <div className="text-center">
                      <div className={`text-xs font-semibold leading-tight ${
                        selectedStaff === '' ? 'text-blue-700' : 'text-slate-700'
                      }`}>
                        Istalgan
                      </div>
                      <div className="text-[10px] text-slate-400">usta</div>
                    </div>
                    {selectedStaff === '' && (
                      <CheckCircle size={14} className="text-blue-500" />
                    )}
                  </button>

                  {business.staff.map(st => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStaff(st.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[80px] transition-all border-2 flex-shrink-0 ${
                        selectedStaff === st.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl overflow-hidden transition-colors ${
                        selectedStaff === st.id ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                      } ${!st.avatar ? (selectedStaff === st.id ? 'bg-blue-100' : 'bg-slate-100') : ''}`}>
                        {st.avatar
                          ? <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" />
                          : '👤'
                        }
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-semibold leading-tight ${
                          selectedStaff === st.id ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                          {st.name}
                        </div>
                        {st.specialization && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[70px]">{st.specialization}</div>
                        )}
                      </div>
                      {selectedStaff === st.id && (
                        <CheckCircle size={14} className="text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              Davom etish
              <span className="text-lg">→</span>
            </button>
          </div>
        )}

        {/* ===== STEP 2: Sana va vaqt ===== */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-up">
            {/* Sana tanlash */}
            <div>
              <h2 className="font-bold text-slate-800 text-lg mb-3">Sanani tanlang</h2>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                {days.map((day, i) => {
                  const isSelected = selectedDate?.toDateString() === day.toDateString()
                  const isToday = i === 0
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={`flex flex-col items-center px-3 py-3.5 rounded-2xl min-w-[66px] border-2 transition-all flex-shrink-0 ${
                        isSelected
                          ? 'border-blue-500 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${
                        isSelected ? 'text-blue-100' : isToday ? 'text-blue-500' : 'text-slate-400'
                      }`}>
                        {isToday ? 'Bugun' : UZ_DAYS[day.getDay()]}
                      </span>
                      <span className={`font-bold text-xl leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {day.getDate()}
                      </span>
                      <span className={`text-[10px] mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {UZ_MONTHS[day.getMonth()].slice(0, 3)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Vaqt tanlash */}
            {selectedDate ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-slate-800 text-lg">
                    Vaqtni tanlang
                  </h2>
                  {loadingSlots && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-500">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {loadingSlots
                    ? ALL_TIME_SLOTS.slice(0, 12).map((_, i) => (
                        <div key={i} className="skeleton h-10 rounded-xl" />
                      ))
                    : ALL_TIME_SLOTS.map(time => {
                        const isBooked = bookedSlots.includes(time)
                        const isSelected = selectedTime === time
                        return (
                          <button
                            key={time}
                            onClick={() => !isBooked && setSelectedTime(time)}
                            disabled={isBooked}
                            className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                              isBooked
                                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                                : isSelected
                                ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'border-slate-100 bg-white hover:border-blue-300 hover:bg-blue-50 text-slate-700'
                            }`}
                          >
                            {time}
                          </button>
                        )
                      })
                  }
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 px-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded-sm bg-blue-600" />
                    <span>Bo'sh</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
                    <span>Band</span>
                  </div>
                  {selectedTime && (
                    <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-blue-600">
                      <Clock size={11} />
                      <span>{selectedTime} tanlandi</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-8 text-center border-2 border-dashed border-slate-200">
                <CalendarDays size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Avval sanani tanlang</p>
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-200 disabled:shadow-none"
            >
              Davom etish →
            </button>
          </div>
        )}

        {/* ===== STEP 3: Ma'lumotlar ===== */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            <div>
              <h2 className="font-bold text-slate-800 text-lg mb-1">Ma'lumotlaringiz</h2>
              <p className="text-sm text-slate-400">Tasdiqlash SMS ushbu raqamga yuboriladi</p>
            </div>

            {/* Bron xulosasi */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5">
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Bron xulosasi</p>
              </div>
              <div className="divide-y divide-slate-50 text-sm">
                {business && (
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-slate-400 flex items-center gap-1.5"><MapPin size={13} />Joy</span>
                    <span className="font-semibold text-slate-800">{business.name}</span>
                  </div>
                )}
                {selectedService && (
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-slate-400 flex items-center gap-1.5"><Sparkles size={13} />Xizmat</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[55%]">
                      {business?.services.find(s => s.id === selectedService)?.name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-slate-400 flex items-center gap-1.5"><CalendarDays size={13} />Sana</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDate?.getDate()} {UZ_MONTHS[selectedDate?.getMonth() ?? 0]}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-slate-400 flex items-center gap-1.5"><Clock size={13} />Vaqt</span>
                  <span className="font-bold text-blue-600 text-base">{selectedTime}</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ismingiz <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="To'liq ismingiz"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Telefon raqam <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-600 whitespace-nowrap flex items-center">
                    +998
                  </div>
                  <div className="relative flex-1">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="90 123 45 67"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                      maxLength={9}
                      className="w-full border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Izoh <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
                </label>
                <textarea
                  placeholder="Maxsus xohishlar, savollar..."
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-400 transition-colors resize-none bg-white"
                />
              </div>
            </div>

            {/* Login info */}
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <span>
                  <Link href="/auth/login" className="font-bold underline underline-offset-2">Kirish</Link> orqali bronlaringizni kuzatib boring va bekor qilish imkoniga ega bo'ling.
                </span>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!form.name || form.phone.length < 9 || submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-200 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Bronni tasdiqlash</span>
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
              <span>To'lov joyda amalga oshiriladi</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-green-600">Bron bepul</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
