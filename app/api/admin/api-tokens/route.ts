import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json([])
  const { data, error } = await supabase
    .from('api_tokens')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json()
  const token = randomBytes(32).toString('base64url')
  const { data, error } = await supabase.from('api_tokens').insert([{
    name: body.name,
    token,
    intents: body.intents || [],
  }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const { ids } = await req.json()
  if (!ids?.length) return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
  const { error } = await supabase.from('api_tokens').delete().in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
