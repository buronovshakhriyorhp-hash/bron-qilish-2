-- ============================================================
-- BronUz — To'liq Database Sxemasi
-- Supabase SQL Editor da ishga tushiring
-- ============================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Lokatsiya uchun

-- ============================================================
-- 1. KATEGORIYALAR
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,        -- O'zbekcha nomi
  name_ru TEXT,                 -- Ruscha nomi
  slug TEXT UNIQUE NOT NULL,    -- URL uchun: restoran, shifokor, ...
  icon TEXT,                    -- Emoji yoki icon nomi
  color TEXT DEFAULT '#3b82f6', -- Rang kodi
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. FOYDALANUVCHILAR PROFILI
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avtomatik profil yaratish trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 3. BIZNESLAR
-- ============================================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id),

  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,

  -- Manzil
  address TEXT,
  district TEXT,        -- Tuman: Yunusobod, Chilonzor, ...
  city TEXT DEFAULT 'Toshkent',

  -- Lokatsiya (koordinatalar)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Aloqa
  phone TEXT,
  phone2 TEXT,
  website TEXT,
  instagram TEXT,
  telegram TEXT,

  -- Media
  cover_image TEXT,
  logo TEXT,
  images TEXT[] DEFAULT '{}',

  -- Statistika
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  booking_count INT DEFAULT 0,

  -- Holat
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. ISH SOATLARI
-- ============================================================
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Yakshanba
  is_open BOOLEAN DEFAULT true,
  open_time TIME DEFAULT '09:00',
  close_time TIME DEFAULT '18:00',

  UNIQUE(business_id, day_of_week)
);

-- ============================================================
-- 5. XIZMATLAR
-- ============================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 60,  -- Xizmat davomiyligi (daqiqa)
  price_min DECIMAL(10,2),          -- Minimal narx
  price_max DECIMAL(10,2),          -- Maksimal narx
  price_label TEXT,                  -- "20,000 - 50,000 so'm"

  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. XODIMLAR / USTALAR
-- ============================================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  specialization TEXT,
  avatar TEXT,
  experience_years INT,

  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- Xodim qaysi xizmatlarni ko'rsatadi
CREATE TABLE staff_services (
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

-- ============================================================
-- 7. BRONLAR
-- ============================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Bog'liqliklar
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,

  -- Vaqt
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Aloqa (login qilmagan foydalanuvchilar uchun)
  customer_name TEXT,
  customer_phone TEXT,
  customer_note TEXT,

  -- Holat
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Kutilmoqda
    'confirmed',  -- Tasdiqlangan
    'cancelled',  -- Bekor qilingan
    'completed',  -- Yakunlangan
    'no_show'     -- Kelmagan
  )),

  -- Narx
  price DECIMAL(10,2),

  -- Bekor qilish sababi
  cancel_reason TEXT,
  cancelled_by TEXT CHECK (cancelled_by IN ('user', 'business')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. IZOHLAR VA BAHOLASHLAR
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,

  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rating yangilanish trigger
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET
    rating = (SELECT AVG(rating) FROM reviews WHERE business_id = NEW.business_id AND is_visible = true),
    review_count = (SELECT COUNT(*) FROM reviews WHERE business_id = NEW.business_id AND is_visible = true)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ============================================================
-- 9. SEVIMLILAR
-- ============================================================
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, business_id)
);

-- ============================================================
-- 10. RLS (Row Level Security) — Xavfsizlik
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hamma profillarni ko'ra oladi" ON profiles FOR SELECT USING (true);
CREATE POLICY "Faqat o'z profilini yangilaydi" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hamma bizneslarni ko'ra oladi" ON businesses FOR SELECT USING (is_active = true);
CREATE POLICY "Egasi biznesni boshqaradi" ON businesses FOR ALL USING (auth.uid() = owner_id);

-- Bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foydalanuvchi o'z bronlarini ko'radi" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Foydalanuvchi bron yaratadi" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Foydalanuvchi o'z bronini bekor qiladi" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hamma izohlarni ko'radi" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Foydalanuvchi izoh yozadi" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 11. BOSHLANG'ICH MA'LUMOTLAR (Kategoriyalar)
-- ============================================================
INSERT INTO categories (name_uz, name_ru, slug, icon, color, sort_order) VALUES
  ('Restoran & Kafe',   'Ресторан & Кафе',   'restoran',    '🍽️', '#ef4444', 1),
  ('Shifokor & Klinika','Врач & Клиника',     'shifokor',    '🏥', '#22c55e', 2),
  ('Sartaroshxona',     'Парикмахерская',     'sartarosh',   '💈', '#a855f7', 3),
  ('Beauty Salon',      'Салон красоты',      'beauty',      '💅', '#ec4899', 4),
  ('Mehmonxona',        'Гостиница',          'mehmonxona',  '🏨', '#f59e0b', 5),
  ('Sport Zal',         'Спортзал',           'sport',       '🏋️', '#06b6d4', 6),
  ('Avto-servis',       'Автосервис',         'avto',        '🚗', '#64748b', 7),
  ('O''quv Markaz',     'Учебный центр',      'oquv',        '📚', '#8b5cf6', 8);

-- ============================================================
-- INDEKSLAR (Tezlashtirish uchun)
-- ============================================================
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_rating ON businesses(rating DESC);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_reviews_business ON reviews(business_id);
