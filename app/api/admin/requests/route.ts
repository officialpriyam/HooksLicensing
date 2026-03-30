import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json([])
  const search = req.nextUrl.searchParams.get('search') || ''
  const productId = req.nextUrl.searchParams.get('productId') || ''
  const from = req.nextUrl.searchParams.get('from') || ''
  const to = req.nextUrl.searchParams.get('to') || ''

  let query = supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (search) query = query.ilike('license_key', `%${search}%`)
  if (productId) query = query.eq('product_id', productId)
  if (from) query = query.gte('request_date', from)
  if (to) query = query.lte('request_date', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
