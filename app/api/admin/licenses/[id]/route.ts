import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json()
  const { data, error } = await supabase.from('licenses').update({
    product_id: body.productId || null,
    product_name: body.productName || '',
    owner_discord_id: body.ownerDiscordId || '',
    owner_discord_username: body.ownerDiscordUsername || '',
    owner_username: body.ownerUsername || '',
    license_platform: body.licensePlatform || '',
    license_platform_user_id: body.licensePlatformUserId || '',
    license_type: body.licenseType || 'PERMANENT',
    status: body.status || 'ACTIVE',
    max_ips: body.maxIps ?? 5,
    max_hwids: body.maxHwids ?? 5,
    ips: body.ips || [],
    hwids: body.hwids || [],
    notes: body.notes || '',
    expiry_date: body.expiresAt || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { error } = await supabase.from('licenses').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
