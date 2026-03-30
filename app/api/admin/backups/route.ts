import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json([])
  const { data, error } = await supabase
    .from('backups')
    .select('id, timestamp, note, type, created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  const body = await req.json()
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 15)

  // Gather all data for the backup snapshot
  const [products, licenses, customers, blacklists] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('licenses').select('*'),
    supabase.from('customers').select('*'),
    supabase.from('blacklists').select('*'),
  ])

  const { data, error } = await supabase.from('backups').insert([{
    timestamp,
    note: body.note || '',
    type: body.type || 'MANUAL',
    data: {
      products: products.data,
      licenses: licenses.data,
      customers: customers.data,
      blacklists: blacklists.data,
      createdAt: new Date().toISOString(),
    },
  }]).select('id, timestamp, note, type, created_at').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
