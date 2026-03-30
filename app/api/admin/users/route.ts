import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json([])
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, role, discord_id, last_login, created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json()
  if (!body.username || !body.password) {
    return NextResponse.json({ error: 'username and password required' }, { status: 400 })
  }
  const { data, error } = await supabase.from('admin_users').insert([{
    username: body.username,
    password_hash: `hash:${body.password}`,
    role: body.role || 'admin',
    discord_id: body.discordId || '',
  }]).select('id, username, role, discord_id, created_at').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
