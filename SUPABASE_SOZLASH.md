# 🔧 Supabase Sozlash — To'liq Qo'llanma

## 1-qadam: Supabase Loyiha Yaratish

1. **https://supabase.com** ga kiring → GitHub bilan kirish
2. **"New Project"** tugmasini bosing
3. Loyiha nomi: `bronuz`
4. Database Password: kuchli parol yozing (yodlab qoling!)
5. Region: **Southeast Asia (Singapore)** — O'zbekistonga eng yaqin
6. **"Create new project"** → ~2 daqiqa kuting

---

## 2-qadam: Database Sxemasini Yuklash

Supabase Dashboard → **SQL Editor** → **"New query"**

### Avval schema.sql ni ishga tushiring:
1. `supabase/schema.sql` faylini oching
2. Butun matnni nusxalab SQL Editor ga joylashtiring
3. **"Run"** tugmasini bosing → "Success" yozuvi chiqishi kerak ✅

### Keyin functions.sql ni ishga tushiring:
1. Yangi query oching
2. `supabase/functions.sql` matnini joylashtiring
3. **"Run"** → ✅

---

## 3-qadam: API Kalitlarini Olish

**Supabase Dashboard → Settings → API**

Quyidagilarni ko'chirib oling:

| Kalit | Qayerdan | .env.local da |
|-------|----------|----------------|
| Project URL | "Project URL" | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | "Project API keys" → anon | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | "Project API keys" → service_role | `SUPABASE_SERVICE_ROLE_KEY` |

### .env.local faylini yarating:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4-qadam: SMS Login Sozlash (Phone Auth)

### Variant A: Twilio (Global, to'lov talab qiladi)

1. **https://twilio.com** → ro'yxatdan o'ting
2. Console → Phone Numbers → bir raqam sotib oling (~$1/oy)
3. Twilio console dan: Account SID, Auth Token, Phone Number oling

**Supabase Dashboard → Authentication → Providers → Phone**
- Enable Phone: **ON**
- SMS Provider: **Twilio**
- Account SID, Auth Token, va Phone Number kiriting
- **Save** ✅

### Variant B: Eskiz.uz (O'zbekiston, arzon)

1. **https://eskiz.uz** → ro'yxatdan o'ting
2. API kalitini oling
3. Supabase → Authentication → Providers → Phone
   - SMS Provider: **Custom HTTP**
   - HTTP Method: POST
   - HTTP URL: `https://notify.eskiz.uz/api/message/sms/send`
   - Headers: `Authorization: Bearer YOUR_ESKIZ_TOKEN`
   - Body: `{"mobile_phone": "{{ .Phone }}", "message": "BronUz tasdiqlash kodi: {{ .Code }}", "from": "4546"}`

> 💡 **Test uchun**: Supabase → Authentication → Settings → "Enable phone confirmations" ni o'chiring. Shunda SMS yuborilmaydi, kod avtomatik 123456 bo'ladi.

---

## 5-qadam: Authentication Sozlamalari

**Supabase Dashboard → Authentication → URL Configuration**

- Site URL: `http://localhost:3000` (ishlab chiqishda)
- Redirect URLs ga qo'shing: `http://localhost:3000/**`

Deploy qilgandan keyin Vercel URL ni ham qo'shing:
- `https://your-app.vercel.app/**`

---

## 6-qadam: Sinov Qilish

```bash
npm run dev
```

1. http://localhost:3000 ga kiring
2. Navbar → "Kirish" tugmasini bosing
3. Telefon raqamingizni kiriting
4. SMS kodni kiriting
5. Muvaffaqiyatli kirgandan keyin profil sahifasiga o'ting

---

## ✅ Hammasi Ulandi — Tekshirish Ro'yxati

- [ ] `schema.sql` Supabase da ishladi
- [ ] `functions.sql` Supabase da ishladi  
- [ ] `.env.local` fayl yaratildi va to'ldirildi
- [ ] `npm run dev` xatosiz ishlayapti
- [ ] Login sahifasi ochilyapti
- [ ] SMS kod kelmoqda (yoki test rejimida 123456)
- [ ] Bron qilish ishlayapti
- [ ] Profil sahifasida bronlar ko'rinyapti
