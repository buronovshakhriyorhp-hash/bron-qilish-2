# 🏷️ BronUz — O'zbekistonda Bron Qilish Platformasi

O'zbekistondagi barcha xizmatlarni (restoran, shifokor, sartarosh, beauty salon va boshqalar) bitta joyda onlayn bron qilish imkonini beruvchi platforma.

---

## 📁 Loyiha Strukturasi

```
bronuz/
├── src/
│   ├── app/                     # Next.js sahifalar
│   │   ├── page.tsx             # Bosh sahifa
│   │   ├── layout.tsx           # Asosiy layout
│   │   ├── globals.css          # Global CSS
│   │   ├── business/[id]/       # Biznes detail sahifasi
│   │   ├── categories/[slug]/   # Kategoriya sahifasi
│   │   ├── booking/[businessId]/ # Bron qilish sahifasi
│   │   └── profile/             # Foydalanuvchi profili
│   ├── components/
│   │   ├── ui/                  # UI komponentlar (Navbar, ...)
│   │   ├── booking/             # Bron qilish komponentlari
│   │   └── business/            # Biznes kartalari
│   ├── lib/
│   │   └── supabase/            # Supabase client/server
│   └── types/                   # TypeScript turlari
├── supabase/
│   └── schema.sql               # Database sxemasi
├── .env.local.example           # Environment o'zgaruvchilar namunasi
└── README.md
```

---

## 🚀 Ishga Tushirish (0 dan boshlash)

### 1-qadam: Node.js o'rnatish
1. https://nodejs.org saytiga kiring
2. LTS versiyasini yuklab o'rnating
3. Terminal/CMD ni qayta oching

### 2-qadam: Loyihani o'rnatish
```bash
# Loyiha papkasiga kiring
cd "D:\claude\projects\startup 1\bronuz"

# Kutubxonalarni o'rnatish
npm install

# Ishga tushirish
npm run dev
```

Brauzerda http://localhost:3000 ni oching — sayt ko'rinadi! ✅

---

## 🗄️ Supabase (Database) O'rnatish

### 1. Supabase hisob yaratish
1. https://supabase.com ga kiring
2. "Start your project" → GitHub bilan kirish
3. "New Project" → Loyiha nomini kiriting: `bronuz`
4. Parol yozing (yodlab qoling!)
5. Region: `Southeast Asia (Singapore)` — O'zbekistonga yaqin
6. "Create new project" → 2-3 daqiqa kuting

### 2. Database sxemasini yuklash
1. Supabase dashboard → SQL Editor
2. `supabase/schema.sql` faylini oching
3. Butun matnni nusxalab SQL Editor ga joylashtiring
4. "Run" tugmasini bosing ✅

### 3. API kalitlarini olish
1. Supabase → Settings → API
2. Quyidagilarni nusxalang:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. .env.local fayl yaratish
```bash
# bronuz papkasida yangi fayl yarating: .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗺️ Yandex Maps API

1. https://developer.tech.yandex.ru ga kiring
2. "Yangi ilova" yarating
3. "JavaScript API and HTTP Geokoder API" tanlang
4. API kalitini `.env.local` ga qo'shing

---

## 🌐 Interneta Deploy Qilish (Vercel)

Saytni internetga chiqarish uchun:

1. https://vercel.com ga kiring (GitHub bilan kirish)
2. "New Project" → GitHub repository tanlang
3. Environment Variables bo'limiga `.env.local` dagi barcha qiymatlarni kiriting
4. "Deploy" — 2-3 daqiqada sayt tayyor! 🚀

Vercel bepul va avtomatik HTTPS beradi.

---

## 📱 Texnologiyalar

| Texnologiya | Maqsad | Narxi |
|-------------|--------|-------|
| **Next.js 14** | Frontend (web sahifalar) | Bepul |
| **Tailwind CSS** | Dizayn | Bepul |
| **Supabase** | Database, auth, real-time | Bepul (500MB) |
| **Vercel** | Hosting | Bepul |
| **Yandex Maps** | Xarita | 1000 so'rov/kun bepul |

**Boshlash uchun 0 so'm sarflaysiz!**

---

## 🛣️ Keyingi Qadamlar (Roadmap)

### Faza 2 (Biznes Panel)
- [ ] Biznes owner dashboard
- [ ] Bronlarni tasdiqlash/bekor qilish
- [ ] Ish soatlarini sozlash
- [ ] SMS xabarnomalar (Eskiz.uz API)

### Faza 3 (Rivojlantirish)
- [ ] Yandex Maps integratsiyasi
- [ ] Izohlar tizimi
- [ ] To'lov (Click, Payme)
- [ ] Push bildirishnomalar

### Faza 4 (Mobile App)
- [ ] React Native (Expo)
- [ ] App Store va Google Play

---

## 📞 Muammolar bo'lsa

Har qanday savol uchun loyihangiz bo'lgan Cowork sessiyasida so'rang!
