import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Check for custom admin token instead of Supabase Auth
  const token = request.cookies.get('adminToken')?.value

  // Protect all /admin routes — redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/admin') && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}
