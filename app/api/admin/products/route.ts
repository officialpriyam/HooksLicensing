import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json([], { status: 200 }) // Return empty array if Supabase not configured
  }
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }
  const body = await req.json()
  const { data, error } = await supabase.from('products').insert([{
    name: body.name,
    description: body.description,
    product_type: body.product_type,
    other_product_type: body.other_product_type,
    product_url: body.product_url,
    product_image_url: body.product_image_url,
    role_id: body.role_id,
    purchase_role_id: body.purchase_role_id,
    default_max_ips: body.default_max_ips ?? 5,
    default_max_hwids: body.default_max_hwids ?? 5,
  }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
