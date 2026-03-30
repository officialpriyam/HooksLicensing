import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array(5).fill(null).map(() =>
    Array(4).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-')
}

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json([])
  const search = req.nextUrl.searchParams.get('search') || ''
  let query = supabase.from('licenses').select('*, products(name, product_image_url, product_url)').order('created_at', { ascending: false })
  if (search) query = query.ilike('license_key', `%${search}%`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json()
  const licenseKey = body.licenseKey || generateLicenseKey()
  const { data, error } = await supabase.from('licenses').insert([{
    license_key: licenseKey,
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
    issue_date: new Date().toISOString(),
    expiry_date: body.expiresAt || null,
  }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
