'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { loadOAuthSettings } from '@/lib/auth-store'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [discordOAuthEnabled, setDiscordOAuthEnabled] = useState(false)

  useEffect(() => {
    const settings = loadOAuthSettings()
    setDiscordOAuthEnabled(settings.enableDiscordLogin)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || 'Login failed')
      } else {
        document.cookie = `adminToken=${data.token}; path=/; SameSite=Lax`
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('hls_session', JSON.stringify({
          userId: data.userId,
          username: data.username,
          role: data.role,
          token: data.token,
        }))
        toast.success('Login successful!')
        router.push('/admin')
      }
    } catch (error) {
      toast.error('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDiscordLogin = () => {
    const settings = loadOAuthSettings()
    if (!settings.discordClientId || !settings.discordRedirectUri) {
      toast.error('Discord OAuth is not configured. Set it up in Settings > OAuth / Discord Login Setup.')
      return
    }
    const params = new URLSearchParams({
      client_id: settings.discordClientId,
      redirect_uri: settings.discordRedirectUri,
      response_type: 'code',
      scope: 'identify guilds.members.read',
    })
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#13151a] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-base">
          &#9728;
        </div>
        <span className="text-white text-2xl font-bold">Hook License System</span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-[#1c1f26] border border-[#2a2d35] rounded-lg p-8">
        <h2 className="text-white text-2xl font-bold mb-6">Log in</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-slate-300 text-sm font-medium">
              Username <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="bg-[#13151a] border-[#2a2d35] text-white focus:border-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 text-sm font-medium">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="bg-[#13151a] border-[#2a2d35] text-white focus:border-slate-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-white text-black hover:bg-slate-100 font-semibold"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        {/* Role notice */}
        <p className="text-xs text-slate-500 text-center mt-4">
          Only users with the <span className="text-red-400">Admin</span> role can access this panel.
        </p>
      </div>

      {/* Discord Login */}
      <div className="mt-4 w-full max-w-sm">
        <Button
          variant="outline"
          className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white border-[#5865f2] hover:border-[#4752c4] font-semibold gap-2"
          onClick={handleDiscordLogin}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.132 18.12c2.053 1.508 4.041 2.423 5.993 3.029a.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.029.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          {discordOAuthEnabled ? 'Login with Discord' : 'Login with Discord (configure in Settings)'}
        </Button>
      </div>

      {/* Default credentials hint */}
      <p className="mt-6 text-xs text-slate-600">
        Default credentials: admin / admin123
      </p>
    </div>
  )
}
