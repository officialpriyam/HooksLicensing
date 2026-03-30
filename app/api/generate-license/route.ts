import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const SECRET_KEY = process.env.LICENSE_API_SECRET || 'hooklicense-secret-key-2025'

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array(5).fill(null).map(() =>
    Array(4).fill(null).map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
  ).join('-')
}

export async function POST(request: NextRequest) {
  const secretKey = request.headers.get('x-secret-key')
  if (!secretKey || secretKey !== SECRET_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing x-secret-key header' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { productId, ownerDiscordId = '', ownerDiscordUsername = '', licenseType = 'PERMANENT',
      maxIps = 5, maxHwids = 5, expiresAt = null, notes = '', status = 'ACTIVE' } = body

    if (!productId) return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 })

    const supabase = createServiceClient()
    const { data: product, error: productError } = await supabase.from('products').select('*').eq('id', productId).single()
    if (productError || !product) {
      return NextResponse.json({ success: false, error: `Product "${productId}" not found` }, { status: 404 })
    }

    const validTypes = ['PERMANENT', 'TEMPORARY', 'SUBSCRIPTION']
    if (!validTypes.includes(licenseType)) {
      return NextResponse.json({ success: false, error: `licenseType must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    const licenseKey = generateLicenseKey()
    const { data: license, error } = await supabase.from('licenses').insert([{
      license_key: licenseKey,
      product_id: product.id,
      product_name: product.name,
      owner_discord_id: String(ownerDiscordId),
      owner_discord_username: String(ownerDiscordUsername),
      owner_username: String(ownerDiscordUsername),
      license_type: licenseType,
      status,
      max_ips: Number(maxIps),
      max_hwids: Number(maxHwids),
      ips: [],
      hwids: [],
      notes: String(notes),
      expiry_date: expiresAt ? new Date(expiresAt).toISOString() : null,
      issue_date: new Date().toISOString(),
    }]).select().single()

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: 'License generated successfully', license }, { status: 201 })
  } catch (error) {
    console.error('License generation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/generate-license',
    description: 'Generate a new license key for a product (saved to Supabase)',
    authentication: 'Required: x-secret-key header',
    requestBody: {
      productId: 'uuid (required)',
      ownerDiscordId: 'string (optional)',
      ownerDiscordUsername: 'string (optional)',
      licenseType: 'PERMANENT | TEMPORARY | SUBSCRIPTION',
      maxIps: 'number (default: 5)',
      maxHwids: 'number (default: 5)',
      expiresAt: 'ISO 8601 date or null',
      notes: 'string (optional)',
      status: 'ACTIVE | INACTIVE',
    },
  })
}
