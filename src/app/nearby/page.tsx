'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { MapPin, Star, Navigation, Loader2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Business, Category } from '@/types'

const CATEGORY_FILTERS = [
  { slug: 'all', label: 'Barchasi' },
  { slug: 'restoran', label: '🍽️ Restoran' },
  { slug: 'sartarosh', label: '💈 Sartarosh' },
  { slug: 'shifokor', label: '🏥 Shifokor' },
  { slug: 'beauty', label: '💅 Beauty' },
  { slug: 'sport', label: '🏋️ Sport' },
  { slug: 'avto', label: '🚗 Avto' },
]

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function NearbyPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [locationName, setLocationName] = useState<string>('Aniqlanmoqda...')
  const [mapLoaded, setMapLoaded] = useState(false)

  const loadBusinesses = useCallback(async (category: string) => {
    setLoading(true)
    const supabase = createClient()

    let q = supabase
      .from('businesses')
      .select('*, category:categories(id, name_uz, slug, icon, color)')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(30)

    if (category !== 'all') {
      q = q.eq('categories.slug', category) as typeof q
    }

    const { data } = await q
    setBusinesses(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Brauzeringiz joylashuvni qo\'llab-quvvatlamaydi')
      loadBusinesses(activeCategory)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserCoords(coords)
        setLocationName('Joylashuv aniqlandi')
        loadBusinesses(activeCategory)
      },
      () => {
        setLocationError('Joylashuv ruxsati berilmadi')
        setLocationName('Toshkent')
        loadBusinesses(activeCategory)
      },
      { timeout: 8000 }
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    loadBusinesses(slug)
  }

  const sortedBusinesses = userCoords
    ? [...businesses].sort((a, b) => {
        if (!a.latitude || !a.longitude) return 1
        if (!b.latitude || !b.longitude) return -1
        const da = distanceKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude)
        const db = distanceKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude)
        return da - db
      })
    : businesses

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Script 
        src={`https://api-maps.yandex.ru/2.1/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || ''}&lang=uz_UZ`}
        onReady={() => setMapLoaded(true)}
      />
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Navigation size={18} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Yaqin joylarda</h1>
          <p className="text-sm text-slate-500">Joylashuvingizga eng yaqin xizmatlar</p>
        </div>
      </div>

      {/* Location banner */}
      <div className={`border rounded-2xl p-4 mb-6 flex items-center justify-between ${locationError ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
        <div className="flex items-center gap-3 text-sm">
          {locationError ? (
            <AlertCircle size={16} className="text-amber-500 shrink-0" />
          ) : (
            <MapPin size={16} className="text-blue-600 shrink-0" />
          )}
          <span className="text-slate-600">
            {locationError
              ? <span className="text-amber-700">{locationError} — umumiy natijalar ko'rsatilmoqda</span>
              : <span>Joylashuv: <strong className="text-slate-800">{locationName}</strong></span>
            }
          </span>
        </div>
        {!locationError && !userCoords && (
          <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {CATEGORY_FILTERS.map((cat, i) => (
          <button
            key={cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.slug
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Business list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4 bg-white rounded-2xl p-3 border border-slate-100 animate-pulse">
              <div className="w-8 h-24 bg-slate-100 rounded" />
              <div className="w-24 h-24 bg-slate-100 rounded-xl" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-3 bg-slate-100 rounded w-1/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedBusinesses.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">📍</div>
          <p>Bu kategoriyada bizneslar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBusinesses.map((biz, i) => {
            const dist = userCoords && biz.latitude && biz.longitude
              ? distanceKm(userCoords.lat, userCoords.lng, biz.latitude, biz.longitude)
              : null
            const distLabel = dist !== null ? `${dist < 1 ? (dist * 1000).toFixed(0) + ' m' : dist.toFixed(1) + ' km'}` : null

            return (
              <Link
                key={biz.id}
                href={`/business/${biz.id}`}
                className="flex gap-4 bg-white rounded-2xl p-3 border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all group"
              >
                {/* Rank */}
                <div className="text-2xl font-black text-slate-100 w-8 flex items-center justify-center shrink-0">
                  {i + 1}
                </div>

                {/* Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  {biz.cover_image ? (
                    <img src={biz.cover_image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🏢</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-blue-600 font-medium">
                        {(biz.category as Category | undefined)?.name_uz || 'Biznes'}
                      </span>
                      <h3 className="font-bold text-slate-800 leading-tight">{biz.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${biz.is_verified ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {biz.is_verified ? 'Tasdiqlangan' : 'Faol'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    {distLabel && (
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <MapPin size={11} /> {distLabel}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {biz.rating.toFixed(1)} ({biz.review_count})
                    </span>
                    {biz.address && (
                      <span className="truncate">{biz.address}</span>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center pr-1">
                  <button className="bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap">
                    Bron →
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Yandex Maps Area */}
      <YandexMapView businesses={sortedBusinesses} userCoords={userCoords} mapLoaded={mapLoaded} />
    </div>
  )
}

function YandexMapView({ businesses, userCoords, mapLoaded }: { businesses: Business[], userCoords: {lat: number, lng: number} | null, mapLoaded: boolean }) {
  useEffect(() => {
    if (!mapLoaded || !(window as any).ymaps) return;

    let map: any = null;

    (window as any).ymaps.ready(() => {
      const container = document.getElementById('ymap');
      if (!container || container.innerHTML !== '') return;

      const centerLat = userCoords ? userCoords.lat : 41.2995;
      const centerLng = userCoords ? userCoords.lng : 69.2401;

      map = new (window as any).ymaps.Map('ymap', {
        center: [centerLat, centerLng],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      });

      if (userCoords) {
        const userMarker = new (window as any).ymaps.Placemark(
          [userCoords.lat, userCoords.lng],
          { hintContent: 'Sizning joylashuvingiz' },
          { preset: 'islands#redCircleDotIcon' }
        );
        map.geoObjects.add(userMarker);
      }

      businesses.forEach(biz => {
        if (biz.latitude && biz.longitude) {
          const bizMarker = new (window as any).ymaps.Placemark(
            [biz.latitude, biz.longitude],
            {
              hintContent: biz.name,
              balloonContent: `
                <div style="padding: 10px; min-width: 180px; font-family: sans-serif;">
                  <h4 style="font-weight: 700; margin-bottom: 4px; font-size: 14px; color: #1e293b;">${biz.name}</h4>
                  <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">${biz.address || ''}</p>
                  <a href="/business/${biz.id}" target="_blank" style="display: block; text-align: center; background: #2563eb; color: white; padding: 8px 12px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">Batafsil</a>
                </div>
              `
            },
            { preset: 'islands#blueDotIcon' }
          );
          map.geoObjects.add(bizMarker);
        }
      });
    });

    return () => {
      if (map && typeof map.destroy === 'function') {
        map.destroy();
      }
      const container = document.getElementById('ymap');
      if (container) container.innerHTML = '';
    };
  }, [mapLoaded, businesses, userCoords]);

  return (
    <div className="mt-6 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      {!mapLoaded && (
        <div className="h-96 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
          <Loader2 size={24} className="animate-spin mb-3 text-blue-500" />
          <p className="text-sm font-medium">Xarita yuklanmoqda...</p>
        </div>
      )}
      <div id="ymap" className="w-full h-96" style={{ visibility: mapLoaded ? 'visible' : 'hidden' }} />
    </div>
  );
}
