'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react'
import { mockApiTokens, mockProducts } from '@/lib/mock-data'

type ApiToken = (typeof mockApiTokens)[0]

const ALL_INTENTS = [
  'LICENSE VALIDATE',
  'LICENSES READ',
  'LICENSES READ WRITE',
  'BLACKLISTS READ',
  'BLACKLISTS READ WRITE',
  'CUSTOMERS READ',
  'CUSTOMERS READ WRITE',
  'PRODUCTS READ',
  'ALL READ',
  'ALL READ WRITE',
]

function generateSecret(len = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array(len)
    .fill(null)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('')
}

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array(44)
    .fill(null)
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('')
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard')
}

const CODE_PHP = `<?php
// Hook License System - Custom Store Integration
// Called by your store when a purchase is confirmed

$apiSecret = 'YOUR_STORE_API_SECRET';  // Set in Integrations > Custom Store
$hookUrl   = 'YOUR_APP_URL/api/v1/custom-store/webhook';

function sendLicenseWebhook(array $data, string $secret, string $url): void {
    $payload = json_encode($data);
    $sig     = hash_hmac('sha256', $payload, $secret);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'X-Hook-Signature: ' . $sig,
        ],
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    // $response contains { "license": "XXXX-XXXX-XXXX", "sent": true }
}

// After your checkout is confirmed:
sendLicenseWebhook([
    'productId'   => '602',          // Your Hook product ID
    'email'       => $buyerEmail,
    'discordId'   => $buyerDiscordId ?? null,
    'discordUser' => $buyerDiscordUsername ?? null,
    'orderId'     => $orderId,
    'buyerName'   => $buyerName,
], $apiSecret, $hookUrl);
`

const CODE_TS = `// Hook License System - Custom Store Integration (TypeScript / Node.js)
import crypto from 'crypto'
import fetch from 'node-fetch'

const API_SECRET = process.env.HOOK_STORE_SECRET!  // Set in Integrations > Custom Store
const HOOK_URL   = process.env.HOOK_APP_URL + '/api/v1/custom-store/webhook'

interface PurchasePayload {
  productId:    string
  email:        string
  discordId?:   string
  discordUser?: string
  orderId:      string
  buyerName?:   string
}

export async function notifyHookSystem(data: PurchasePayload) {
  const payload = JSON.stringify(data)
  const sig = crypto.createHmac('sha256', API_SECRET).update(payload).digest('hex')

  const res = await fetch(HOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Hook-Signature': sig,
    },
    body: payload,
  })

  const json = await res.json()
  // json.license  – the generated license key
  // json.sent     – true if DM was delivered to Discord
  return json
}

// Usage after successful payment:
// await notifyHookSystem({
//   productId:  '602',
//   email:      buyer.email,
//   discordId:  buyer.discordId,
//   discordUser: buyer.discordUsername,
//   orderId:    order.id,
// })
`

const CODE_JS = `// Hook License System - Custom Store Integration (JavaScript / Node.js)
const crypto = require('crypto')
const fetch  = require('node-fetch')

const API_SECRET = process.env.HOOK_STORE_SECRET   // Set in Integrations > Custom Store
const HOOK_URL   = process.env.HOOK_APP_URL + '/api/v1/custom-store/webhook'

async function notifyHookSystem(data) {
  const payload = JSON.stringify(data)
  const sig = crypto.createHmac('sha256', API_SECRET).update(payload).digest('hex')

  const res = await fetch(HOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Hook-Signature': sig,
    },
    body: payload,
  })

  const json = await res.json()
  // json.license  – the generated license key
  // json.sent     – true if DM was delivered to Discord
  return json
}

// Usage after successful payment:
// notifyHookSystem({
//   productId:  '602',
//   email:      buyer.email,
//   discordId:  buyer.discordId,
//   discordUser: buyer.discordUsername,
//   orderId:    order.id,
// }).then(console.log)
`

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('discord')

  // ── Discord Bot settings ──────────────────────────────────
  const [discordToken, setDiscordToken] = useState('')
  const [showDiscordToken, setShowDiscordToken] = useState(false)
  const [botApiUrl, setBotApiUrl] = useState('')
  const [botStatus, setBotStatus] = useState<'unknown' | 'running' | 'stopped'>('unknown')
  const [checkingBot, setCheckingBot] = useState(false)

  // Admin role
  const [adminRoleInput, setAdminRoleInput] = useState('')
  const [adminRoles, setAdminRoles] = useState<string[]>(['SUN'])

  // Alert channels
  const [commandsChannel, setCommandsChannel] = useState('')
  const [licenseAlertChannel, setLicenseAlertChannel] = useState('')
  const [notificationChannel, setNotificationChannel] = useState('')

  // OAuth2
  const [discordClientId, setDiscordClientId] = useState('1386410631288324146')
  const [discordClientSecret, setDiscordClientSecret] = useState('')
  const [showClientSecret, setShowClientSecret] = useState(false)

  // ── BuiltByBit settings ───────────────────────────────────
  const [bbbProduct, setBbbProduct] = useState('')
  const [bbbSecret, setBbbSecret] = useState(generateSecret())

  // ── Custom Store settings ─────────────────────────────────
  const [customStoreUrl, setCustomStoreUrl] = useState('')
  const [customStoreSecret, setCustomStoreSecret] = useState(generateSecret())
  const [customStoreProduct, setCustomStoreProduct] = useState('')
  const [activeSnippet, setActiveSnippet] = useState<'php' | 'ts' | 'js'>('ts')

  // ── API tokens ────────────────────────────────────────────
  const [apiTokens, setApiTokens] = useState<ApiToken[]>(mockApiTokens as ApiToken[])
  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenIntents, setNewTokenIntents] = useState('ALL READ WRITE')
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(new Set())

  // Bot status check
  const checkBotStatus = async () => {
    if (!botApiUrl) {
      toast.error('Enter your Bot API URL first')
      return
    }
    setCheckingBot(true)
    try {
      const res = await fetch(botApiUrl.replace(/\/$/, '') + '/status', {
        signal: AbortSignal.timeout(5000),
      })
      setBotStatus(res.ok ? 'running' : 'stopped')
    } catch {
      setBotStatus('stopped')
    } finally {
      setCheckingBot(false)
    }
  }

  // Admin role management
  const addAdminRole = () => {
    const trimmed = adminRoleInput.trim()
    if (!trimmed) return
    if (adminRoles.includes(trimmed)) {
      toast.error('Role already added')
      return
    }
    setAdminRoles([...adminRoles, trimmed])
    setAdminRoleInput('')
  }
  const removeAdminRole = (role: string) => setAdminRoles(adminRoles.filter((r) => r !== role))

  // API token management
  const handleCreateToken = () => {
    if (!newTokenName.trim()) {
      toast.error('Token name is required')
      return
    }
    const token: ApiToken = {
      id: String(Date.now()),
      name: newTokenName,
      token: generateToken(),
      intents: [newTokenIntents],
      createdAt: new Date().toISOString(),
    }
    setApiTokens([...apiTokens, token])
    toast.success('API token created')
    setNewTokenName('')
    setNewTokenIntents('ALL READ WRITE')
  }

  const handleDeleteSelected = () => {
    setApiTokens(apiTokens.filter((t) => !selectedTokenIds.has(t.id)))
    setSelectedTokenIds(new Set())
    toast.success('Tokens deleted')
  }

  const toggleTokenSelect = (id: string) => {
    const next = new Set(selectedTokenIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedTokenIds(next)
  }

  const snippetCode = activeSnippet === 'php' ? CODE_PHP : activeSnippet === 'ts' ? CODE_TS : CODE_JS

  return (
    <div className="space-y-0">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex">
          <TabsList className="w-full rounded-none bg-slate-900 border-b border-slate-700 h-10 p-0">
            {['discord', 'builtbybit', 'custom-store', 'api'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 rounded-none data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 h-full capitalize"
              >
                {tab === 'builtbybit'
                  ? 'BuiltByBit'
                  : tab === 'custom-store'
                  ? 'Custom Store'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── DISCORD TAB ─────────────────────────────────────── */}
        <TabsContent value="discord" className="mt-0 p-6 space-y-10">
          {/* Bot Settings */}
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Discord Bot</h2>
            <p className="text-slate-400 text-sm mb-6">
              Configure your Discord bot for automated license alerts and commands.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Token */}
              <div className="space-y-1">
                <Label className="text-slate-300">Discord Token</Label>
                <div className="relative flex items-center">
                  <Input
                    type={showDiscordToken ? 'text' : 'password'}
                    value={discordToken}
                    onChange={(e) => setDiscordToken(e.target.value)}
                    placeholder="Bot token from Discord Developer Portal"
                    className="bg-slate-800 border-slate-600 text-white pr-20"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowDiscordToken(!showDiscordToken)}
                      className="text-slate-400 hover:text-slate-300 p-1"
                    >
                      {showDiscordToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {discordToken && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(discordToken)}
                        className="text-slate-400 hover:text-slate-300 p-1"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Get your bot token from the{' '}
                  <a
                    href="https://discord.com/developers/applications"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Discord Developer Portal
                  </a>
                  .
                </p>
              </div>

              {/* Bot API URL */}
              <div className="space-y-1">
                <Label className="text-slate-300">Bot API URL</Label>
                <Input
                  value={botApiUrl}
                  onChange={(e) => setBotApiUrl(e.target.value)}
                  placeholder="https://your-bot-host:port"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500">
                  The base URL where your Discord bot is hosted (used to check status).
                </p>
              </div>

              {/* Admin Roles */}
              <div className="space-y-1">
                <Label className="text-slate-300">Admin Role IDs</Label>
                <div className="flex gap-2">
                  <Input
                    value={adminRoleInput}
                    onChange={(e) => setAdminRoleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addAdminRole()}
                    placeholder="Role ID or name"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Button
                    size="sm"
                    onClick={addAdminRole}
                    className="bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {adminRoles.map((role) => (
                    <span
                      key={role}
                      className="flex items-center gap-1 bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded"
                    >
                      {role}
                      <button onClick={() => removeAdminRole(role)} className="text-slate-400 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Discord Role IDs that have admin permissions. Press Enter or + to add.
                </p>
              </div>

              {/* Bot Status */}
              <div className="space-y-1">
                <Label className="text-slate-300">Bot Status</Label>
                <div className="flex items-center gap-3 bg-slate-800 border border-slate-600 rounded px-3 py-2 h-10">
                  {botStatus === 'unknown' && (
                    <span className="flex items-center gap-2 text-slate-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                      Unknown — check bot status
                    </span>
                  )}
                  {botStatus === 'running' && (
                    <span className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Bot is Running
                    </span>
                  )}
                  {botStatus === 'stopped' && (
                    <span className="flex items-center gap-2 text-red-400 text-sm">
                      <XCircle className="w-4 h-4" />
                      Bot is Stopped / Unreachable
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto text-slate-400 hover:text-white h-6 px-2 gap-1 text-xs"
                    onClick={checkBotStatus}
                    disabled={checkingBot}
                  >
                    <RefreshCw className={`w-3 h-3 ${checkingBot ? 'animate-spin' : ''}`} />
                    Check
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Pings your bot API URL to check if it is reachable.
                </p>
              </div>

              {/* Commands Alert Channel */}
              <div className="space-y-1">
                <Label className="text-slate-300">Commands Alert Channel ID</Label>
                <Input
                  value={commandsChannel}
                  onChange={(e) => setCommandsChannel(e.target.value)}
                  placeholder="e.g. 1234567890123456789"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500">
                  Discord channel ID where command alerts are sent.
                </p>
              </div>

              {/* License Alert Channel */}
              <div className="space-y-1">
                <Label className="text-slate-300">License Alert Channel ID</Label>
                <Input
                  value={licenseAlertChannel}
                  onChange={(e) => setLicenseAlertChannel(e.target.value)}
                  placeholder="e.g. 1234567890123456789"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500">
                  Discord channel ID where license request alerts are sent.
                </p>
              </div>

              {/* Notification Alert Channel */}
              <div className="space-y-1">
                <Label className="text-slate-300">Notification Alert Channel ID</Label>
                <Input
                  value={notificationChannel}
                  onChange={(e) => setNotificationChannel(e.target.value)}
                  placeholder="e.g. 1234567890123456789"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-500">
                  Discord channel ID where general notifications are sent.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                className="bg-white text-black hover:bg-slate-100"
                onClick={() => toast.success('Discord bot settings saved')}
              >
                Save Discord Bot Settings
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 gap-2"
                onClick={() =>
                  window.open('https://discord.com/developers/applications', '_blank')
                }
              >
                <ExternalLink className="w-4 h-4" />
                Discord Developer Portal
              </Button>
            </div>
          </div>

          {/* OAuth2 Section */}
          <div className="border-t border-slate-700 pt-8">
            <h3 className="text-lg font-semibold text-white mb-1">Discord OAuth2 Login</h3>
            <p className="text-slate-400 text-sm mb-4">
              Configure Discord OAuth2 for customer portal authentication.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div className="space-y-1">
                <Label className="text-slate-300">Client ID</Label>
                <Input
                  value={discordClientId}
                  onChange={(e) => setDiscordClientId(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Client Secret</Label>
                <div className="relative">
                  <Input
                    type={showClientSecret ? 'text' : 'password'}
                    value={discordClientSecret}
                    onChange={(e) => setDiscordClientSecret(e.target.value)}
                    placeholder="OAuth2 client secret"
                    className="bg-slate-800 border-slate-600 text-white pr-10"
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
            </div>
            <Button
              className="bg-white text-black hover:bg-slate-100 mt-4"
              onClick={() => toast.success('OAuth2 settings saved')}
            >
              Save OAuth2 Settings
            </Button>
          </div>
        </TabsContent>

        {/* ── BUILTBYBIT TAB ──────────────────────────────────── */}
        <TabsContent value="builtbybit" className="mt-0 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">BuiltByBit Integration</h2>
              <p className="text-slate-400 text-sm">
                When a customer purchases your product on BuiltByBit, a license is automatically
                generated and sent to their email and Discord DM.
              </p>
            </div>
            <a
              href="/docs/builtbybit"
              className="shrink-0 ml-4 inline-flex items-center gap-1.5 text-xs bg-violet-600/20 hover:bg-violet-600/30 border border-violet-600/30 text-violet-300 px-3 py-1.5 rounded-md transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              View Setup Guide
            </a>
          </div>

          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-slate-300">Product</Label>
                <Select value={bbbProduct} onValueChange={setBbbProduct}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {mockProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Map this BuiltByBit product to a Hook License System product.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-300">Webhook URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`https://YOUR_APP_URL/api/v1/bbb/${bbbProduct || '{YOUR_PRODUCT_ID}'}`}
                    readOnly
                    className="bg-slate-800 border-slate-600 text-slate-300 text-sm font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() =>
                      copyToClipboard(
                        `https://YOUR_APP_URL/api/v1/bbb/${bbbProduct || '{YOUR_PRODUCT_ID}'}`
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Paste this URL into your BuiltByBit resource webhook settings.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Webhook Secret</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={bbbSecret}
                  readOnly
                  className="bg-slate-800 border-slate-600 text-slate-300 font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() => copyToClipboard(bbbSecret)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 gap-1 whitespace-nowrap"
                  onClick={() => {
                    setBbbSecret(generateSecret())
                    toast.success('New secret generated')
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Also enter this secret in your BuiltByBit webhook settings so requests can be
                verified. Regenerating will invalidate the old secret immediately.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 space-y-2">
              <p className="font-semibold text-white">How it works</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Customer buys your product on BuiltByBit.</li>
                <li>BuiltByBit sends a purchase webhook to the URL above.</li>
                <li>Hook License System verifies the request using the secret.</li>
                <li>A license key is automatically generated for the customer.</li>
                <li>The license is emailed to the customer.</li>
                <li>If the customer has linked their Discord, the key is also sent via DM.</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 gap-2"
                onClick={() =>
                  window.open(
                    'https://builtbybit.com/wiki/webhooks/',
                    '_blank'
                  )
                }
              >
                <ExternalLink className="w-4 h-4" />
                BuiltByBit Webhook Docs
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── CUSTOM STORE TAB ─────────────────────────────────── */}
        <TabsContent value="custom-store" className="mt-0 p-6">
          <h2 className="text-xl font-bold text-white mb-1">Custom Store Integration</h2>
          <p className="text-slate-400 text-sm mb-6">
            Connect any custom store or checkout system. When a purchase is confirmed, your store
            calls our webhook and we automatically generate and deliver the license.
          </p>

          <div className="space-y-6 max-w-2xl mb-8">
            <div className="space-y-1">
              <Label className="text-slate-300">Default Product</Label>
              <Select value={customStoreProduct} onValueChange={setCustomStoreProduct}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select a product (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {mockProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Default product if the payload does not include a productId.
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Store API URL</Label>
              <Input
                value={customStoreUrl}
                onChange={(e) => setCustomStoreUrl(e.target.value)}
                placeholder="https://your-store.com (optional, for callbacks)"
                className="bg-slate-800 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-500">
                If set, Hook License System will send a confirmation callback to this URL after
                generating the license.
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">API Secret</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={customStoreSecret}
                  readOnly
                  className="bg-slate-800 border-slate-600 text-slate-300 font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() => copyToClipboard(customStoreSecret)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 gap-1 whitespace-nowrap"
                  onClick={() => {
                    setCustomStoreSecret(generateSecret())
                    toast.success('New secret generated')
                  }}
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Use this secret to sign your webhook requests (HMAC-SHA256). Keep it private.
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Webhook Endpoint</Label>
              <div className="flex items-center gap-2">
                <Input
                  value="https://YOUR_APP_URL/api/v1/custom-store/webhook"
                  readOnly
                  className="bg-slate-800 border-slate-600 text-slate-300 font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() =>
                    copyToClipboard('https://YOUR_APP_URL/api/v1/custom-store/webhook')
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              className="bg-white text-black hover:bg-slate-100"
              onClick={() => toast.success('Custom store settings saved')}
            >
              Save Custom Store Settings
            </Button>
          </div>

          {/* Code Guide */}
          <div className="border-t border-slate-700 pt-8">
            <h3 className="text-lg font-semibold text-white mb-1">Integration Guide</h3>
            <p className="text-slate-400 text-sm mb-4">
              Call our webhook from your checkout server after a successful payment. Choose your
              language:
            </p>

            {/* Snippet language tabs */}
            <div className="flex gap-1 mb-0">
              {(['ts', 'js', 'php'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveSnippet(lang)}
                  className={`px-4 py-1.5 text-sm rounded-t font-mono uppercase tracking-wide border-b-0 transition-colors ${
                    activeSnippet === lang
                      ? 'bg-slate-800 text-white border border-slate-600 border-b-slate-800'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <pre className="bg-slate-800 border border-slate-600 rounded-b rounded-tr p-4 text-xs text-slate-300 overflow-x-auto font-mono whitespace-pre leading-5 max-h-[480px]">
              {snippetCode}
            </pre>

            <div className="mt-6 bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-white">Payload fields</p>
              <table className="w-full text-slate-400 text-xs">
                <thead>
                  <tr className="text-slate-300 text-left">
                    <th className="pb-1 pr-4">Field</th>
                    <th className="pb-1 pr-4">Type</th>
                    <th className="pb-1">Description</th>
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {[
                    ['productId', 'string', 'Hook License System product ID'],
                    ['email', 'string', "Buyer's email — license is sent here"],
                    ['discordId', 'string?', "Buyer's Discord user ID for DM delivery"],
                    ['discordUser', 'string?', "Buyer's Discord username"],
                    ['orderId', 'string', 'Your order reference'],
                    ['buyerName', 'string?', "Buyer's name (optional)"],
                  ].map(([field, type, desc]) => (
                    <tr key={field}>
                      <td className="pr-4 font-mono text-slate-200 py-0.5">{field}</td>
                      <td className="pr-4 font-mono text-amber-400 py-0.5">{type}</td>
                      <td className="py-0.5">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 space-y-2">
              <p className="font-semibold text-white">Response</p>
              <pre className="font-mono text-xs text-slate-300">
{`{
  "license": "XXXX-XXXX-XXXX-XXXX-XXXX",  // generated license key
  "sent": true                              // true if Discord DM was delivered
}`}
              </pre>
            </div>
          </div>
        </TabsContent>

        {/* ── API TAB ─────────────────────────────────────────── */}
        <TabsContent value="api" className="mt-0 p-6">
          <h2 className="text-xl font-bold text-white mb-6">API Token Management</h2>

          <div className="flex items-end gap-3 mb-6 flex-wrap">
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Name</Label>
              <Input
                placeholder="Token name"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white w-48"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Token</Label>
              <Input
                placeholder="Auto-generated"
                readOnly
                className="bg-slate-800 border-slate-600 text-slate-400 w-80"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Intents</Label>
              <Select value={newTokenIntents} onValueChange={setNewTokenIntents}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {ALL_INTENTS.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateToken} className="bg-white text-black hover:bg-slate-100">
              Create API Token
            </Button>
            <Button
              variant="ghost"
              onClick={handleDeleteSelected}
              disabled={selectedTokenIds.size === 0}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
            <Button
              variant="ghost"
              className="text-slate-400 hover:bg-slate-700"
              onClick={() => window.open('/api/generate-license', '_blank')}
            >
              View API Documentation
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300 w-8" />
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Token</TableHead>
                  <TableHead className="text-slate-300">Intents</TableHead>
                  <TableHead className="text-slate-300">Created At</TableHead>
                  <TableHead className="text-slate-300 w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiTokens.map((token) => (
                  <TableRow
                    key={token.id}
                    className={`border-slate-700 hover:bg-slate-700/50 cursor-pointer ${
                      selectedTokenIds.has(token.id) ? 'bg-slate-700/30' : ''
                    }`}
                    onClick={() => toggleTokenSelect(token.id)}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedTokenIds.has(token.id)}
                        onChange={() => toggleTokenSelect(token.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-amber-500"
                      />
                    </TableCell>
                    <TableCell className="text-white font-medium">{token.name}</TableCell>
                    <TableCell className="text-slate-300 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[280px]">{token.token}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(token.token)
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm max-w-[300px]">
                      {token.intents.join(', ')}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {new Date(token.createdAt).toISOString().replace('T', ' ').substring(0, 23)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          setApiTokens(apiTokens.filter((t) => t.id !== token.id))
                          toast.success('Token deleted')
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
