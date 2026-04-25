'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin, Phone, Clock, Star, CheckCircle,
  Instagram, ChevronLeft, Heart, Share2, ChevronDown, ChevronUp
} from 'lucide-react'
import type { Business, Review } from '@/types'
import { formatDistanceToNow } from 'date-fns'

const DAY_NAMES = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  )
}

function formatReviewDate(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

interface Props {
  business: Business
  reviews: Review[]
}

export default function BusinessDetailClient({ business: biz, reviews }: Props) {
  const [descExpanded, setDescExpanded] = useState(false)
  const [liked, setLiked] = useState(false)

  const description = biz.description ?? ''
  const shortDesc = description.length > 120 ? description.slice(0, 120) + '...' : description
  const image = biz.cover_image ?? biz.images?.[0]
  const today = new Date().getDay()

  const hours = biz.hours ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative h-80 w-full overflow-hidden bg-slate-200">
        {image ? (
          <img src={image} alt={biz.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            {biz.category?.icon ?? '🏢'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-medium backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={16} />
            Orqaga
          </Link>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 rounded-xl backdrop-blur-sm bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            aria-label="Sevimlilarga qo'shish"
          >
            <Heart size={18} className={liked ? 'fill-red-400 text-red-400' : 'text-white'} />
          </button>
          <button
            className="w-10 h-10 rounded-xl backdrop-blur-sm bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Ulashish"
          >
            <Share2 size={18} className="text-white" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              {biz.is_verified && (
                <div className="inline-flex items-center gap-1.5 bg-blue-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full mb-2">
                  <CheckCircle size={11} />
                  <span className="font-medium">Tasdiqlangan</span>
                </div>
              )}
              {biz.category && (
                <div className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
                  {biz.category.name_uz}
                </div>
              )}
              <h1 className="text-white font-bold text-2xl leading-tight drop-shadow-sm">{biz.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Info */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-fade-up">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRating rating={biz.rating} />
                  <span className="font-bold text-slate-800">{biz.rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">({biz.review_count} izoh)</span>
                </div>
                {(biz.address || biz.city) && (
                  <div className="flex items-start gap-1.5 text-sm text-slate-600">
                    <MapPin size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{[biz.address, biz.city].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {biz.phone && (
                  <a href={`tel:${biz.phone}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors w-fit">
                    <Phone size={15} className="text-slate-400" />
                    <span>{biz.phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-fade-up delay-100">
                <h2 className="font-bold text-slate-800 text-base mb-3">Biznes haqida</h2>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {descExpanded ? description : shortDesc}
                </p>
                {description.length > 120 && (
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold mt-3 hover:text-blue-700 transition-colors"
                  >
                    {descExpanded ? <>Yig'ish <ChevronUp size={15} /></> : <>Ko'proq o'qish <ChevronDown size={15} /></>}
                  </button>
                )}
              </div>
            )}

            {/* Services */}
            {biz.services && biz.services.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-fade-up delay-200">
                <h2 className="font-bold text-slate-800 text-base mb-4">Xizmatlar va narxlar</h2>
                <div className="space-y-3">
                  {biz.services.filter(s => s.is_active).map(svc => (
                    <div
                      key={svc.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 group transition-all hover:border-blue-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
                          {svc.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                          <Clock size={11} />
                          <span>{svc.duration_minutes} daqiqa</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4 flex flex-col items-end gap-2">
                        <div className="text-sm font-bold text-blue-600">
                          {svc.price_label ?? (svc.price_min ? `${svc.price_min.toLocaleString()} so'm` : 'Kelishilgan')}
                        </div>
                        <Link
                          href={`/booking/${biz.id}?service=${svc.id}`}
                          className="text-xs bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-semibold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Bron →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hours */}
            {hours.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-fade-up delay-300">
                <h2 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Ish soatlari
                </h2>
                <div className="space-y-2">
                  {hours.map(h => {
                    const isToday = h.day_of_week === today
                    return (
                      <div
                        key={h.id}
                        className={`flex justify-between items-center text-sm rounded-xl px-3 py-2.5 transition-colors ${
                          isToday ? 'bg-green-50 border border-green-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isToday && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />}
                          <span className={`font-medium ${isToday ? 'text-green-700' : 'text-slate-600'}`}>
                            {DAY_NAMES[h.day_of_week]}
                            {isToday && <span className="ml-2 text-xs font-semibold text-green-600">(Bugun)</span>}
                          </span>
                        </div>
                        {h.is_open ? (
                          <span className={`font-bold ${isToday ? 'text-green-700' : 'text-slate-800'}`}>
                            {h.open_time.slice(0, 5)} — {h.close_time.slice(0, 5)}
                          </span>
                        ) : (
                          <span className="text-red-400 font-medium">Yopiq</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-fade-up delay-400">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-base">Mijozlar izohlari</h2>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={biz.rating} size={13} />
                  <span className="text-sm font-bold text-slate-700">{biz.rating.toFixed(1)}</span>
                </div>
              </div>
              {reviews.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">Hali izoh yo'q</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review, idx) => {
                    const authorName = review.profile?.full_name ?? 'Foydalanuvchi'
                    return (
                      <div key={review.id} className={`pb-4 ${idx < reviews.length - 1 ? 'border-b border-slate-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {authorName[0]?.toUpperCase() ?? 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-semibold text-sm text-slate-800">{authorName}</span>
                              <StarRating rating={review.rating} size={12} />
                            </div>
                            {review.comment && (
                              <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                            )}
                            <span className="text-xs text-slate-400 mt-1.5 block">{formatReviewDate(review.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h2 className="font-bold text-slate-800 mb-4">Bron qilish</h2>
                <Link
                  href={`/booking/${biz.id}`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-center py-4 rounded-2xl font-bold transition-all text-base shadow-lg shadow-blue-200 mb-3"
                >
                  Bron qilish
                </Link>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <StarRating rating={biz.rating} size={14} />
                  <span className="font-bold text-slate-700 text-sm">{biz.rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs">· {biz.review_count} izoh</span>
                </div>
                <p className="text-xs text-slate-400 text-center mb-4">Bron qilish bepul. Tasdiqlash SMS orqali keladi.</p>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  {biz.phone && (
                    <a href={`tel:${biz.phone}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-green-600 transition-colors group">
                      <div className="w-9 h-9 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                        <Phone size={16} className="text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 text-xs">Qo'ng'iroq qilish</div>
                        <div className="text-xs text-slate-400">{biz.phone}</div>
                      </div>
                    </a>
                  )}
                  {biz.instagram && (
                    <a
                      href={`https://instagram.com/${biz.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-slate-600 hover:text-pink-600 transition-colors group"
                    >
                      <div className="w-9 h-9 bg-pink-50 group-hover:bg-pink-100 rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                        <Instagram size={16} className="text-pink-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 text-xs">Instagram</div>
                        <div className="text-xs text-slate-400">@{biz.instagram}</div>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Gallery */}
              {biz.images && biz.images.length > 1 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Suratlar</p>
                  <div className="grid grid-cols-2 gap-2">
                    {biz.images.slice(1, 5).map((img, i) => (
                      <div key={i} className="overflow-hidden rounded-xl aspect-square">
                        <img src={img} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
