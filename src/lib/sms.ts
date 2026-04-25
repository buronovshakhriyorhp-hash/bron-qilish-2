// SMS xizmati — Eskiz.uz API (O'zbekiston)
// Env o'zgaruvchilar: ESKIZ_EMAIL, ESKIZ_PASSWORD
// Hujjat: https://eskiz.uz/api/docs

const ESKIZ_BASE = 'https://notify.eskiz.uz/api'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getEskizToken(): Promise<string | null> {
  if (!process.env.ESKIZ_EMAIL || !process.env.ESKIZ_PASSWORD) return null

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  try {
    const res = await fetch(`${ESKIZ_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.ESKIZ_EMAIL,
        password: process.env.ESKIZ_PASSWORD,
      }),
    })
    const data = await res.json() as { data?: { token?: string } }
    const token = data?.data?.token
    if (!token) return null

    cachedToken = { token, expiresAt: Date.now() + 29 * 24 * 60 * 60 * 1000 }
    return token
  } catch (err) {
    console.error('Eskiz auth error:', err)
    return null
  }
}

export async function sendSms(phone: string, message: string): Promise<boolean> {
  const token = await getEskizToken()

  if (!token) {
    // Env kalitlari yo'q — development rejimida logga chiqar
    console.log(`[SMS STUB] To: ${phone} | Message: ${message}`)
    return true
  }

  // E.164 formatiga keltirish: +998XXXXXXXXX → 998XXXXXXXXX
  const normalized = phone.replace(/^\+/, '')

  try {
    const res = await fetch(`${ESKIZ_BASE}/message/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mobile_phone: normalized,
        message,
        from: process.env.ESKIZ_SENDER_NAME || '4546',
      }),
    })
    const data = await res.json() as { status?: string }
    return data?.status === 'waiting' || data?.status === 'sent'
  } catch (err) {
    console.error('Eskiz send error:', err)
    return false
  }
}

// ─── Tayyor xabar shablonlari ───────────────────────────────────────────────

export function bookingConfirmedMessage(businessName: string, date: string, time: string) {
  return `BronUz: "${businessName}" da broningiz tasdiqlandi!\nSana: ${date}, Soat: ${time}\nSavollar uchun bizga murojaat qiling.`
}

export function bookingCreatedMessage(businessName: string, date: string, time: string) {
  return `BronUz: "${businessName}" ga broningiz qabul qilindi.\nSana: ${date}, Soat: ${time}\nTasdiqlash kutilmoqda.`
}

export function bookingCancelledMessage(businessName: string) {
  return `BronUz: "${businessName}" dagi broningiz bekor qilindi. Boshqa vaqtni tanlashingiz mumkin: bronuz.uz`
}
