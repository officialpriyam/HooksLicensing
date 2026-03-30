import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { data: user, error } = await supabase
      .from('admin_users')
      .select('*')
      .ilike('username', username)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Verify password (stored as "hash:<plaintext>" for demo; replace with bcrypt in production)
    if (user.password_hash !== `hash:${password}`) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })
    }

    // Role check — only admin role can access the admin panel
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin role required.' }, { status: 403 })
    }

    // Update last_login
    await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', user.id)

    const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64')
    return NextResponse.json({ token, username: user.username, role: user.role, userId: user.id })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

