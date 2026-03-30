'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import {
  Home,
  Package,
  Users,
  Key,
  FileText,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Share2,
  HardDrive,
  BookOpen,
  UserCog,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Home', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/licenses', label: 'Licenses', icon: Key },
  { href: '/admin/requests', label: 'Requests', icon: FileText },
  { href: '/admin/blacklist', label: 'Blacklists', icon: Shield },
  { href: '/admin/integrations', label: 'Integrations', icon: Share2 },
  { href: '/admin/backups', label: 'Backups', icon: HardDrive },
  { href: '/admin/users', label: 'Users & Roles', icon: UserCog },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

const pageTitles: Record<string, string> = {
  '/admin': 'Home',
  '/admin/products': 'Products',
  '/admin/customers': 'Customers',
  '/admin/licenses': 'Licenses',
  '/admin/requests': 'Requests',
  '/admin/blacklist': 'Blacklists',
  '/admin/integrations': 'Integrations',
  '/admin/backups': 'Backups',
  '/admin/users': 'Users & Roles',
  '/admin/settings': 'Settings',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('adminToken')
    localStorage.removeItem('hls_session')
    toast.success('Logged out successfully')
    router.push('/')
  }

  const pageTitle = pageTitles[pathname] || 'Admin'

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-base">
            &#9728;
          </div>
          <h1 className="text-lg font-bold text-white">Hook License</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors mb-0.5 ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-700">
        <Link
          href="/admin/docs"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors mb-0.5"
          onClick={() => setOpen(false)}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Docs</span>
        </Link>
        <Link
          href="/admin/support"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors mb-0.5"
          onClick={() => setOpen(false)}
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Support</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
        <p className="text-xs text-slate-600 text-center mt-3 pb-1">
          &copy; 2025 Hook License System
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 bg-slate-900 border-r border-slate-700 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-300">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-52 bg-slate-900 border-slate-700 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="text-white font-semibold text-base">{pageTitle}</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-slate-900">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
