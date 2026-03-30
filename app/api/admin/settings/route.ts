import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({})
  const { data, error } = await supabase.from('settings').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Convert rows to a key:value map
  const map: Record<string, unknown> = {}
  for (const row of data || []) map[row.key] = row.value
  return NextResponse.json(map)
}

export async function PUT(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json() // { key: string, value: object }
  const { key, value } = body
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })
  const { error } = await supabase.from('settings').upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
