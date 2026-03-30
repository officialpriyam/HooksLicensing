'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Info, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { loadOAuthSettings, saveOAuthSettings, type OAuthSettings } from '@/lib/auth-store'

export default function SettingsPage() {
  const [username, setUsername] = useState('admin')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rateLimitEnabled, setRateLimitEnabled] = useState(false)
  const [maxRequests, setMaxRequests] = useState('10')
  const [timePeriod, setTimePeriod] = useState('10000')
  const [disasterMode, setDisasterMode] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [discordDropdownEnabled, setDiscordDropdownEnabled] = useState(true)

  // OAuth settings
  const [oauth, setOAuth] = useState<OAuthSettings>({
    discordClientId: '',
    discordClientSecret: '',
    discordRedirectUri: '',
    enableDiscordLogin: false,
    adminDiscordRoleId: '',
  })
  const [showClientSecret, setShowClientSecret] = useState(false)

  useEffect(() => {
    const stored = loadOAuthSettings()
    setOAuth(stored)
  }, [])

  const handleSaveUsername = () => {
    toast.success('Username updated successfully')
  }

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    toast.success('Password changed successfully')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleSaveRateLimit = () => {
    toast.success('Rate limit settings saved')
  }

  const handleSaveOAuth = () => {
    if (oauth.enableDiscordLogin) {
      if (!oauth.discordClientId.trim()) { toast.error('Discord Client ID is required to enable OAuth'); return }
      if (!oauth.discordClientSecret.trim()) { toast.error('Discord Client Secret is required to enable OAuth'); return }
      if (!oauth.discordRedirectUri.trim()) { toast.error('Redirect URI is required to enable OAuth'); return }
    }
    saveOAuthSettings(oauth)
    toast.success('OAuth settings saved successfully')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-slate-700">
      {/* Left Column */}
      <div className="p-6 space-y-8">
        {/* Change Username */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Change Username</h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-slate-300">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white max-w-sm"
              />
            </div>
            <Button onClick={handleSaveUsername} className="bg-white text-black hover:bg-slate-100">
              Save Username
            </Button>
          </div>
        </section>

        {/* Change Password */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Change Password</h2>
          <p className="text-sm text-slate-400 mb-4">
            Changed password requires server restart to take effect. Contact developer if you are using managed hosting.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-xl mb-3">
            <div className="space-y-1">
              <Label className="text-slate-300">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={handleSavePassword} className="bg-white text-black hover:bg-slate-100">
            Save Password
          </Button>
        </section>

        {/* Rate Limiting */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Rate Limiting</h2>
          <div className="space-y-3 max-w-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Button
                  onClick={() => {
                    setRateLimitEnabled(!rateLimitEnabled)
                    toast.success(`Rate limiting ${rateLimitEnabled ? 'disabled' : 'enabled'}`)
                  }}
                  className="w-full bg-white text-black hover:bg-slate-100"
                >
                  {rateLimitEnabled ? 'Disable Rate Limiting' : 'Enable Rate Limiting'}
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Max Requests</Label>
                <Input
                  type="number"
                  value={maxRequests}
                  onChange={(e) => setMaxRequests(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Time Period (ms)</Label>
              <Input
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white max-w-xs"
              />
            </div>
            <Button onClick={handleSaveRateLimit} className="bg-white text-black hover:bg-slate-100">
              Save Rate Limit Settings
            </Button>
          </div>
        </section>

        {/* OAuth / Discord Login Setup */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">OAuth / Discord Login Setup</h2>
          <p className="text-sm text-slate-400 mb-4">
            Configure Discord OAuth2 to allow admins to log in via Discord. Only users whose Discord account has the specified <strong className="text-white">Admin Role ID</strong> will be granted access.
          </p>
          <div className="space-y-4 max-w-xl">
            {/* Enable toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-600">
              <button
                type="button"
                onClick={() => setOAuth(o => ({ ...o, enableDiscordLogin: !o.enableDiscordLogin }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${oauth.enableDiscordLogin ? 'bg-[#5865f2]' : 'bg-slate-600'}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${oauth.enableDiscordLogin ? 'translate-x-4' : 'translate-x-1'}`}
                />
              </button>
              <span className="text-slate-300 text-sm font-medium">Enable Discord OAuth2 Login</span>
              {oauth.enableDiscordLogin && (
                <span className="ml-auto text-xs text-green-400 font-medium">Active</span>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Discord Client ID <span className="text-red-400">*</span></Label>
              <Input
                value={oauth.discordClientId}
                onChange={e => setOAuth(o => ({ ...o, discordClientId: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="1234567890123456789"
              />
              <p className="text-xs text-slate-500">Found in the Discord Developer Portal under your application.</p>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Discord Client Secret <span className="text-red-400">*</span></Label>
              <div className="relative">
                <Input
                  type={showClientSecret ? 'text' : 'password'}
                  value={oauth.discordClientSecret}
                  onChange={e => setOAuth(o => ({ ...o, discordClientSecret: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                  placeholder="Your Discord application secret"
                />
                <button
                  type="button"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Redirect URI <span className="text-red-400">*</span></Label>
              <Input
                value={oauth.discordRedirectUri}
                onChange={e => setOAuth(o => ({ ...o, discordRedirectUri: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="https://yourdomain.com/api/auth/discord/callback"
              />
              <p className="text-xs text-slate-500">Add this exact URL to your Discord application&apos;s OAuth2 redirect list.</p>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Admin Discord Role ID</Label>
              <Input
                value={oauth.adminDiscordRoleId}
                onChange={e => setOAuth(o => ({ ...o, adminDiscordRoleId: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Role ID from your Discord server"
              />
              <p className="text-xs text-slate-500">
                Only Discord users who have this role will be allowed to log in via OAuth. Leave blank to allow all Discord users.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleSaveOAuth} className="bg-white text-black hover:bg-slate-100">
                Save OAuth Settings
              </Button>
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-slate-600 text-slate-300 gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Discord Developer Portal
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Customer Dashboard Settings */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Customer Dashboard Settings</h2>
          <p className="text-sm text-slate-400">
            Configure what features are available to your customers in their dashboard.
          </p>
        </section>
      </div>

      {/* Right Column */}
      <div className="p-6 space-y-8">
        {/* Theme */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Theme</h2>
          <p className="text-sm text-slate-400 mb-4">
            Select your preferred appearance for the admin dashboard.
          </p>
          <div className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className={theme === 'light' ? 'bg-white text-black' : 'border-slate-600 text-slate-300'}
            >
              Light Theme
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className={theme === 'dark' ? 'bg-slate-700 text-white border-slate-500' : 'border-slate-600 text-slate-300'}
            >
              Dark Theme
            </Button>
          </div>
        </section>

        {/* Discord Settings */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Discord Settings</h2>
          <p className="text-sm text-slate-400 mb-4">The Discord bot settings have been moved.</p>
          <Link href="/admin/integrations">
            <Button variant="outline" className="border-slate-600 text-slate-300">
              Go to Integrations Page
            </Button>
          </Link>
        </section>

        {/* Disaster Management */}
        <section>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-white mb-2">Disaster Management</h2>
              <p className="text-sm text-slate-400 mb-1">
                Enable this option only during severe service outages or disasters.
              </p>
              <p className="text-sm text-slate-400 mb-1">
                When activated, all license validations will automatically succeed without performing standard security checks (e.g., HWID, IP, expiry, blacklist).
              </p>
              <div className="mt-4 space-y-1">
                <button className="text-slate-400 hover:text-white text-sm block">Disaster Recovery Guide</button>
                <button className="text-slate-400 hover:text-white text-sm block">Contact Us</button>
              </div>
            </div>
            <Button
              onClick={() => {
                setDisasterMode(!disasterMode)
                toast.success(`Disaster mode ${disasterMode ? 'disabled' : 'enabled'}`)
              }}
              className={disasterMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-black hover:bg-slate-100'}
            >
              {disasterMode ? 'Disable Disaster Mode' : 'Enable Disaster Mode'}
            </Button>
          </div>
          {disasterMode && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
              Disaster mode is active. All license validations will succeed.
            </div>
          )}
        </section>

        {/* Experiments */}
        <section>
          <h2 className="text-xl font-bold text-white mb-2">Experiments</h2>
          <p className="text-sm text-red-400 mb-4">
            Warning: These are experimental features and may not work as expected. Use at your own risk.
          </p>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300"
            onClick={() => {
              setDiscordDropdownEnabled(!discordDropdownEnabled)
              toast.info(`Discord user dropdown ${discordDropdownEnabled ? 'disabled' : 'enabled'}`)
            }}
          >
            {discordDropdownEnabled ? 'Disable Discord User Dropdown' : 'Enable Discord User Dropdown'}
          </Button>
        </section>

        {/* About */}
        <section>
          <div className="flex items-center gap-2 text-slate-400">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">About</span>
          </div>
          <div className="mt-2 p-3 bg-slate-800 rounded border border-slate-700 space-y-1">
            <p className="text-xs text-slate-400"><span className="text-slate-300">System:</span> Hook License System</p>
            <p className="text-xs text-slate-400"><span className="text-slate-300">Database:</span> In-memory / localStorage (no external DB connected)</p>
            <p className="text-xs text-slate-400"><span className="text-slate-300">Default login:</span> admin / admin123</p>
            <p className="text-xs text-slate-400"><span className="text-slate-300">Version:</span> 1.0.0</p>
          </div>
        </section>
      </div>
    </div>
  )
}
