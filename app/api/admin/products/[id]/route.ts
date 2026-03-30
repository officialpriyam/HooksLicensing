import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json()
  const { data, error } = await supabase.from('products').update({
    name: body.name,
    description: body.description,
    product_type: body.product_type,
    other_product_type: body.other_product_type,
    product_url: body.product_url,
    product_image_url: body.product_image_url,
    role_id: body.role_id,
    purchase_role_id: body.purchase_role_id,
    default_max_ips: body.default_max_ips,
    default_max_hwids: body.default_max_hwids,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
