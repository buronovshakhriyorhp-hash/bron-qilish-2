import { notFound } from 'next/navigation'
import { getBusinessByIdServer } from '@/lib/db/server-queries'
import type { Business, BusinessHour, Review as ReviewType } from '@/types'
import BusinessDetailClient from './BusinessDetailClient'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const biz = await getBusinessByIdServer(params.id)
  if (!biz) return { title: 'Topilmadi' }
  return {
    title: `${biz.name} — BronUz`,
    description: biz.short_description ?? biz.description ?? '',
  }
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const [biz, reviews] = await Promise.all([
    getBusinessByIdServer(params.id),
    getBusinessReviews(params.id),
  ])

  if (!biz) notFound()

  return <BusinessDetailClient business={biz} reviews={reviews} />
}

async function getBusinessReviews(businessId: string): Promise<ReviewType[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profile:profiles(full_name)')
    .eq('business_id', businessId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return []
  return data || []
}
