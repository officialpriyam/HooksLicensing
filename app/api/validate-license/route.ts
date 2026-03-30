import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { license_key, ip_address, hwid, mac_address, os, os_version, os_architecture, java_version, product_version } = await request.json()

    if (!license_key) {
      return NextResponse.json({ error: 'License key is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch license from Supabase
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*, products(name)')
      .eq('license_key', license_key)
      .single()

    let status = 'Successful'
    let responseType = 'Success'
    let valid = true
    let reason = ''

    if (error || !license) {
      status = 'Invalid License'; responseType = 'Blocked'; valid = false; reason = 'Invalid license key'
    } else if (license.status !== 'ACTIVE') {
      status = `License ${license.status}`; responseType = 'Blocked'; valid = false; reason = `License is ${license.status}`
    } else if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
      status = 'Expired'; responseType = 'Blocked'; valid = false; reason = 'License has expired'
    } else {
      // Check blacklist
      const checks = []
      if (hwid) checks.push({ license_data_type: 'HWID', data: hwid })
      if (ip_address) checks.push({ license_data_type: 'IP', data: ip_address })

      for (const check of checks) {
        const { data: bl } = await supabase.from('blacklists')
          .select('id').eq('license_data_type', check.license_data_type).eq('data', check.data).limit(1)
        if (bl && bl.length > 0) {
          status = `${check.license_data_type} blacklisted`; responseType = 'Blocked'; valid = false
          reason = `${check.license_data_type} is blacklisted`
          break
        }
      }
    }

    // Log the request
    await supabase.from('requests').insert([{
      license_key,
      product_id: license?.product_id || null,
      product_name: license?.product_name || (license?.products as { name: string } | null)?.name || '',
      ip_address: ip_address || '',
      hwid: hwid || '',
      mac_address: mac_address || '',
      operating_system: os || '',
      os_version: os_version || '',
      os_architecture: os_architecture || '',
      java_version: java_version || '',
      product_version: product_version || '',
      request_type: 'Valid',
      response_type: responseType,
      status,
      request_date: new Date().toISOString(),
    }])

    if (!valid) {
      return NextResponse.json({ valid: false, reason }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      license_key,
      productId: license.product_id,
      productName: license.product_name,
      owner: license.owner_username,
      expires_at: license.expiry_date,
    })
  } catch (error) {
    console.error('License validation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
