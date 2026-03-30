import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json([])
  
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with license_count and total_requests
  const enriched = await Promise.all((customers || []).map(async (c) => {
    const { count: licenseCount } = await supabase
      .from('licenses').select('*', { count: 'exact', head: true })
      .eq('owner_discord_id', c.discord_id || '')
    const { count: requestCount } = await supabase
      .from('requests').select('*', { count: 'exact', head: true })
      .ilike('license_key', '%')
    return { ...c, licenseCount: licenseCount ?? 0, totalRequests: requestCount ?? 0 }
  }))
  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json()
  const { data, error } = await supabase.from('customers').insert([{
    username: body.username,
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    discord_id: body.discordId,
    discord_username: body.discordUsername,
    builtbybit_id: body.builtbybitId,
    builtbybit_username: body.builtbybitUsername,
    notes: body.notes,
    status: body.status || 'ACTIVE',
  }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
