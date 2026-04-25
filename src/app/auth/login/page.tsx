'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Shield, Zap, Clock, ArrowRight, ChevronLeft } from 'lucide-react'

// ---- OTP Input Component ----
function OtpInput({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(6, ' ').split('')
    arr[idx] = digit || ' '
    const next = arr.join('').trimEnd()
    onChange(next.replace(/ /g, ''))
    if (digit && idx < 5) {
      refs.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[idx]) {
        const arr = value.split('')
        arr[idx] = ''
        onChange(arr.join(''))
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus()
        const arr = value.split('')
        arr[idx - 1] = ''
        onChange(arr.join(''))
      }
    }
    if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, 5)
    refs.current[focusIdx]?.focus()
  }

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={el => { refs.current[idx] = el }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={e => handleChange(idx, e.target.value)}
          onKeyDown={e => handleKeyDown(idx, e)}
          className={`w-11 h-14 rounded-2xl border-2 text-center text-xl font-bold transition-all duration-200 outline-none
            ${value[idx]
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
              : 'border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:shadow-md'
            }`}
        />
      ))}
    </div>
  )
}

// ---- Spinner ----
function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ---- Main Login Content ----
function LoginContent() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const fullPhone = `+998${phone.replace(/\D/g, '')}`

  const startCountdown = () => {
    setCountdown(30)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const handleSendCode = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 9) {
      toast.error("To'liq telefon raqam kiriting (9 ta raqam)")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: { channel: 'sms' },
      })
      if (error) throw error
      setStep('code')
      startCountdown()
      toast.success(`${fullPhone} ga SMS kod yuborildi`)
    } catch (err: any) {
      console.error(err)
      if (err.message?.includes('SMS') || err.message?.includes('provider')) {
        toast.error('SMS xizmati sozlanmagan.')
      } else {
        toast.error(err.message || 'Xatolik yuz berdi')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("6 ta raqamli kodni kiriting")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: code,
        type: 'sms',
      })
      if (error) throw error
      toast.success('Muvaffaqiyatli kirdingiz!')
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      toast.error(
        err.message === 'Token has expired or is invalid'
          ? "Kod noto'g'ri yoki muddati o'tgan."
          : err.message || 'Xatolik yuz berdi'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setCode('')
    await handleSendCode()
  }

  const features = [
    {
      Icon: Zap,
      title: 'Tez bron qilish',
      desc: 'Bir necha soniyada istalgan xizmatni band qiling',
    },
    {
      Icon: Shield,
      title: 'Xavfsiz va ishonchli',
      desc: 'SMS orqali tasdiqlash — hech qanday parol kerak emas',
    },
    {
      Icon: Clock,
      title: 'Istalgan vaqtda',
      desc: "7/24 ishlaydi, bronlaringizni real vaqtda kuzating",
    },
  ]

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-400/10 rounded-full" />
          <div className="absolute -bottom-16 left-16 w-64 h-64 bg-blue-400/10 rounded-full" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120,119,198,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }} />
        </div>

        {/* Brand */}
        <div className="relative z-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl border border-white/20">
              🏷️
            </div>
            <span className="text-white text-2xl font-extrabold tracking-tight">BronUz</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">O'zbekistondagi #1 bron platforma</p>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-4 animate-fade-up delay-100">
          <h2 className="text-white text-3xl font-bold leading-tight">
            Xizmatlarni<br />
            <span className="text-blue-200">oson va tez</span><br />
            band qiling
          </h2>

          <div className="space-y-3 pt-2">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-blue-200 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 animate-fade-up delay-200">
          <div className="flex gap-6 pt-6 border-t border-white/20">
            {[
              { value: '50K+', label: 'Foydalanuvchi' },
              { value: '1500+', label: 'Biznes' },
              { value: '200K+', label: 'Bron' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-white text-xl font-extrabold">{s.value}</div>
                <div className="text-blue-300 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 lg:bg-white min-h-screen">
        <div className="w-full max-w-sm animate-scale-in">

          {/* Mobile brand */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <span className="text-3xl">🏷️</span>
            <span className="text-2xl font-extrabold text-slate-800">BronUz</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">

            {step === 'phone' ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">Xush kelibsiz! 👋</h1>
                  <p className="text-slate-500 text-sm">
                    Kirish yoki ro'yxatdan o'tish uchun telefon raqamingizni kiriting
                  </p>
                </div>

                {/* Phone input */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Telefon raqam
                  </label>
                  <div className="flex rounded-2xl border-2 border-slate-200 overflow-hidden focus-within:border-blue-500 transition-colors duration-200 bg-white">
                    <div className="flex items-center gap-2 px-4 py-3.5 bg-slate-50 border-r-2 border-slate-200 text-slate-700 font-semibold text-sm shrink-0 select-none">
                      <span className="text-lg">🇺🇿</span>
                      <span>+998</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="90 123 45 67"
                      value={phone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '')
                        if (val.length <= 9) setPhone(val)
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                      className="flex-1 px-4 py-3.5 text-sm font-medium text-slate-800 bg-transparent outline-none tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendCode}
                  disabled={phone.replace(/\D/g, '').length !== 9 || loading}
                  className="btn btn-primary w-full py-4 rounded-2xl text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Spinner className="h-5 w-5" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      SMS kod yuborish
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Back button */}
                <button
                  onClick={() => { setStep('phone'); setCode('') }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Raqamni o'zgartirish
                </button>

                {/* Header */}
                <div className="mb-7 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📱</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Kodni kiriting</h1>
                  <p className="text-slate-500 text-sm">
                    <span className="font-semibold text-slate-700">{fullPhone}</span> ga yuborilgan
                    <br />6 ta raqamli kodni kiriting
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="mb-6">
                  <OtpInput value={code} onChange={setCode} />
                </div>

                <button
                  onClick={handleVerify}
                  disabled={code.length !== 6 || loading}
                  className="btn btn-primary w-full py-4 rounded-2xl text-base mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Spinner className="h-5 w-5" />
                      Tekshirilmoqda...
                    </>
                  ) : (
                    <>
                      Kirish
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-slate-500">
                      Qayta yuborish{' '}
                      <span className="font-bold text-blue-600 tabular-nums">{countdown}s</span>{' '}
                      dan keyin
                    </p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                    >
                      Kodni qayta yuborish
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-slate-400 mt-5 px-4 leading-relaxed">
            Kirish orqali{' '}
            <Link href="/terms" className="text-blue-600 hover:underline font-medium">
              foydalanish shartlarimizga
            </Link>{' '}
            va{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
              maxfiylik siyosatimizga
            </Link>{' '}
            rozilik bildirasiz
          </p>
        </div>
      </div>
    </div>
  )
}

// ---- Export with Suspense (required for useSearchParams in Next.js 14) ----
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl">🏷️</div>
          <div className="text-slate-500 text-sm animate-pulse">Yuklanmoqda...</div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
