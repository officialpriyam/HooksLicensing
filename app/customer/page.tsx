'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Key, Search, Shield, Clock, Infinity } from 'lucide-react'
import { toast } from 'sonner'

type LicenseInfo = {
  license_key: string
  product_name: string
  status: string
  license_type: string
  max_ips: number
  max_hwids: number
  ips: string[]
  hwids: string[]
  expiry_date: string | null
  notes: string
}

export default function CustomerPage() {
  const [key, setKey] = useState('')
  const [license, setLicense] = useState<LicenseInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) {
      toast.error('Please enter a license key')
      return
    }
    setLoading(true)
    setSearched(false)
    setLicense(null)
    try {
      const res = await fetch(`/api/admin/licenses?search=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      const found = Array.isArray(data)
        ? data.find((l: LicenseInfo) => l.license_key.toLowerCase() === trimmed.toLowerCase())
        : null
      setLicense(found || null)
      setSearched(true)
      if (!found) toast.error('No license found with that key')
    } catch {
      toast.error('Failed to look up license')
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const isExpired = license?.expiry_date ? new Date(license.expiry_date) < new Date() : false
  const statusColor =
    isExpired || license?.status === 'EXPIRED'
      ? 'text-red-400 bg-red-500/10 border-red-500/20'
      : license?.status === 'BANNED'
      ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
      : license?.status === 'ACTIVE'
      ? 'text-green-400 bg-green-500/10 border-green-500/20'
      : 'text-slate-400 bg-slate-500/10 border-slate-500/20'

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-start py-16 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <Key className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">License Lookup</h1>
          <p className="text-slate-400 text-sm mt-1 text-center">
            Enter your license key to check its status and details
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleLookup} className="flex gap-2 mb-8">
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
            className="bg-slate-800 border-slate-600 text-white font-mono flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Looking up...' : 'Lookup'}
          </Button>
        </form>

        {/* Result */}
        {searched && !license && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <Shield className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">No license found</p>
            <p className="text-slate-500 text-sm mt-1">
              Double-check the key and try again.
            </p>
          </div>
        )}

        {license && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {/* Status banner */}
            <div className={`px-5 py-3 border-b ${statusColor} flex items-center justify-between`}>
              <span className="font-semibold text-sm">
                {isExpired ? 'EXPIRED' : license.status}
              </span>
              <span className="text-xs opacity-70">{license.license_type}</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Key */}
              <div>
                <p className="text-slate-400 text-xs mb-1">License Key</p>
                <p className="font-mono text-amber-300 text-sm bg-slate-900 rounded px-3 py-2 break-all">
                  {license.license_key}
                </p>
              </div>

              {/* Product */}
              <div>
                <p className="text-slate-400 text-xs mb-1">Product</p>
                <p className="text-white font-medium">{license.product_name || '—'}</p>
              </div>

              {/* Expiry */}
              <div>
                <p className="text-slate-400 text-xs mb-1">Expiry</p>
                {license.expiry_date ? (
                  <p className={`text-sm flex items-center gap-1 ${isExpired ? 'text-red-400' : 'text-slate-300'}`}>
                    <Clock className="w-3 h-3" />
                    {new Date(license.expiry_date).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <Infinity className="w-3 h-3" /> Permanent
                  </p>
                )}
              </div>

              {/* IPs */}
              <div>
                <p className="text-slate-400 text-xs mb-1">
                  IPs used: {(license.ips || []).length} / {license.max_ips === -1 ? 'unlimited' : license.max_ips}
                </p>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{
                      width: license.max_ips > 0
                        ? `${Math.min(((license.ips || []).length / license.max_ips) * 100, 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              {/* HWIDs */}
              <div>
                <p className="text-slate-400 text-xs mb-1">
                  HWIDs used: {(license.hwids || []).length} / {license.max_hwids === -1 ? 'unlimited' : license.max_hwids}
                </p>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{
                      width: license.max_hwids > 0
                        ? `${Math.min(((license.hwids || []).length / license.max_hwids) * 100, 100)}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>

              {license.notes && (
                <div>
                  <p className="text-slate-400 text-xs mb-1">Notes</p>
                  <p className="text-slate-300 text-sm">{license.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
