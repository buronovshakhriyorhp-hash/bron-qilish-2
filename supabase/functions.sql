-- ============================================================
-- BronUz — Qo'shimcha SQL Funksiyalar
-- Schema.sql dan KEYIN ishga tushiring
-- ============================================================

-- Bron sonini oshirish (atomic)
CREATE OR REPLACE FUNCTION increment_booking_count(business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET booking_count = booking_count + 1
  WHERE id = business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Biznes egasining o'z bizneslarini ko'rishi uchun policy
CREATE POLICY "Ega o'z biznesini ko'radi" ON businesses
  FOR SELECT USING (auth.uid() = owner_id OR is_active = true);

-- Biznes egasi o'z biznesini o'zgartira oladi
CREATE POLICY "Ega biznesni yangilaydi" ON businesses
  FOR UPDATE USING (auth.uid() = owner_id);

-- Biznes egasi o'z biznesining bronlarini ko'ra oladi
CREATE POLICY "Ega o'z biznesining bronlarini ko'radi" ON bookings
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Biznes egasi bronlar holatini o'zgartira oladi
CREATE POLICY "Ega bronni tasdiqlaydi" ON bookings
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );
