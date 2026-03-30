'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Package, Key, Settings, FileText, Settings2, X } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function buildChartData(start: string, end: string, requests: any[]) {
  const startMs = new Date(start).getTime()
  const endMs = new Date(end + 'T23:59:59Z').getTime()

  const buckets: Record<string, { Successful: number; Rejected: number; Invalid: number }> = {}

  const cursor = new Date(start)
  while (cursor.getTime() <= endMs) {
    const key = cursor.toISOString().substring(0, 10)
    buckets[key] = { Successful: 0, Rejected: 0, Invalid: 0 }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  for (const req of requests) {
    const d = new Date(req.request_date || req.requestDate)
    if (d.getTime() < startMs || d.getTime() > endMs) continue
    const key = d.toISOString().substring(0, 10)
    if (!buckets[key]) buckets[key] = { Successful: 0, Rejected: 0, Invalid: 0 }
    const status = req.status || ''
    if (status === 'Successful') buckets[key].Successful++
    else if (
      status === 'HWID blacklisted' ||
      status === 'IP blacklisted' ||
      status === 'Expired' ||
      status === 'Banned'
    )
      buckets[key].Rejected++
    else buckets[key].Invalid++
  }

  return Object.entries(buckets).map(([date, counts]) => ({
    date: date.substring(5),
    ...counts,
  }))
}

const DISCORD_CONFIGURED = false

export default function AdminDashboard() {
  const [showBanner, setShowBanner] = useState(!DISCORD_CONFIGURED)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 29)

  const fmt = (d: Date) => d.toISOString().substring(0, 10)

  const [startDate, setStartDate] = useState(fmt(thirtyDaysAgo))
  const [endDate, setEndDate] = useState(fmt(today))
  const now = new Date()

  const { data: products = [] } = useSWR('/api/admin/products', fetcher, { revalidateOnFocus: false })
  const { data: licenses = [] } = useSWR('/api/admin/licenses', fetcher, { revalidateOnFocus: false })
  const { data: requests = [] } = useSWR('/api/admin/requests', fetcher, { revalidateOnFocus: false })

  const safeProducts  = Array.isArray(products) ? products : []
  const safeLicenses  = Array.isArray(licenses)  ? licenses  : []
  const safeRequests  = Array.isArray(requests)  ? requests  : []

  const chartData = useMemo(
    () => buildChartData(startDate, endDate, safeRequests),
    [startDate, endDate, safeRequests]
  )

  const totalProducts = safeProducts.length
  const totalLicenses = safeLicenses.length
  const totalRequests = safeRequests.length

  const successCount = safeRequests.filter((r: any) => r.status === 'Successful').length
  const rejectedCount = safeRequests.filter(
    (r: any) =>
      r.status === 'HWID blacklisted' ||
      r.status === 'IP blacklisted' ||
      r.status === 'Expired' ||
      r.status === 'Banned'
  ).length
  const invalidCount = totalRequests - successCount - rejectedCount

  const activeCount  = safeLicenses.filter((l: any) => l.status === 'ACTIVE').length
  const expiredCount = safeLicenses.filter((l: any) => l.status === 'EXPIRED').length

  return (
    <div className="space-y-0 -m-4 md:-m-8">
      {showBanner && (
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-white flex-shrink-0" />
          <div className="flex-1">
            <span className="text-white font-semibold">Setup Discord Bot</span>
            <span className="text-slate-400 text-sm ml-2">
              Setup your Discord bot to enable Discord features for Hook License System!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/integrations">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-slate-100 text-xs h-8 gap-1"
              >
                <Settings2 className="w-3 h-3" />
                Setup Discord Bot
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 text-xs h-8 gap-1"
              onClick={() => window.open('https://discord.com/developers/applications', '_blank')}
            >
              Discord Developer Portal
            </Button>
            <button
              className="text-slate-400 hover:text-slate-200 text-sm px-2"
              onClick={() => setShowBanner(false)}
            >
              {"Don't show again"}
            </button>
            <button
              className="text-slate-400 hover:text-white"
              onClick={() => setShowBanner(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* User / Time / Status bar */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs">
            a
          </div>
          <span className="text-sm">a</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="text-slate-500">&#128336;</span>
            <span>
              {now.toISOString().replace('T', ' ').substring(0, 19)} UTC
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          System Operational
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-b border-slate-700">
        <Link
          href="/admin/products"
          className="p-6 border-r border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-slate-300" />
                <span className="text-white font-semibold text-lg">Products</span>
              </div>
              <p className="text-slate-400 text-sm">Manage your product catalog</p>
            </div>
            <span className="bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded">
              {totalProducts}
            </span>
          </div>
        </Link>
        <Link
          href="/admin/requests"
          className="p-6 border-r border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-slate-300" />
                <span className="text-white font-semibold text-lg">Requests</span>
              </div>
              <p className="text-slate-400 text-sm">View and manage requests</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-green-400">{successCount} ok</span>
                <span className="text-xs text-red-400">{rejectedCount} blocked</span>
                <span className="text-xs text-slate-400">{invalidCount} invalid</span>
              </div>
            </div>
            <span className="bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded">
              {totalRequests}
            </span>
          </div>
        </Link>
        <Link
          href="/admin/licenses"
          className="p-6 border-r border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-5 h-5 text-slate-300" />
                <span className="text-white font-semibold text-lg">Licenses</span>
              </div>
              <p className="text-slate-400 text-sm">Monitor active licenses</p>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-green-400">{activeCount} active</span>
                <span className="text-xs text-slate-400">{expiredCount} expired</span>
              </div>
            </div>
            <span className="bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded">
              {totalLicenses}
            </span>
          </div>
        </Link>
        <Link
          href="/admin/settings"
          className="p-6 hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Settings className="w-5 h-5 text-slate-300" />
                <span className="text-white font-semibold text-lg">Settings</span>
              </div>
              <p className="text-slate-400 text-sm">Configure system settings</p>
            </div>
          </div>
        </Link>
      </div>

      {/* License Requests Chart */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-xl">License Requests</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />
              Successful
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />
              Rejected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-slate-400 inline-block" />
              Invalid
            </span>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-sm">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white w-44 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-sm">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white w-44 text-sm"
            />
          </div>
          <div className="ml-auto text-xs text-slate-500">
            Showing {chartData.reduce((s, d) => s + d.Successful + d.Rejected + d.Invalid, 0)} requests
            in selected range
          </div>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              label={{
                value: 'License Requests',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 12,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#e2e8f0',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
            />
            <Bar dataKey="Successful" stackId="a" fill="#22c55e" />
            <Bar dataKey="Rejected" stackId="a" fill="#ef4444" />
            <Bar dataKey="Invalid" stackId="a" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
