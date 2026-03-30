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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Search, RefreshCw, Minus, Plus } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type License = {
  id: string
  license_key: string
  product_id: string | null
  product_name: string
  owner_discord_id: string
  owner_discord_username: string
  owner_username: string
  license_platform: string
  license_platform_user_id: string
  license_type: string
  status: string
  max_ips: number
  max_hwids: number
  ips: string[]
  hwids: string[]
  notes: string
  expiry_date: string | null
}

type Product = { id: string; name: string }

const LICENSE_PLATFORMS = ['Minecraft', 'Discord', 'Web', 'BuiltByBit']
const LICENSE_TYPES = ['PERMANENT', 'TEMPORARY', 'SUBSCRIPTION']
const LICENSE_STATUSES = ['ACTIVE', 'INACTIVE', 'EXPIRED', 'BANNED']

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array(5)
    .fill(null)
    .map(() =>
      Array(4)
        .fill(null)
        .map(() => chars[Math.floor(Math.random() * chars.length)])
        .join('')
    )
    .join('-')
}

export default function LicensesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('manage')
  const [editingLicense, setEditingLicense] = useState<License | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { data, mutate, isLoading } = useSWR(
    searchTerm ? `/api/admin/licenses?search=${encodeURIComponent(searchTerm)}` : '/api/admin/licenses',
    fetcher,
    { revalidateOnFocus: false }
  )
  const licenses: License[] = Array.isArray(data) ? data : []

  const { data: productsData } = useSWR('/api/admin/products', fetcher, { revalidateOnFocus: false })
  const products: Product[] = Array.isArray(productsData) ? productsData : []

  const [createForm, setCreateForm] = useState({
    licenseKey: '',
    productId: '',
    ownerDiscordId: '',
    ownerDiscordUsername: '',
    licensePlatform: '',
    licensePlatformUserId: '',
    licenseType: 'PERMANENT',
    maxHwids: 5,
    maxIps: 5,
    ips: '',
    hwids: '',
    status: 'ACTIVE',
    notes: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.licenseKey || !createForm.productId) {
      toast.error('License key and product are required')
      return
    }
    setIsSaving(true)
    try {
      const product = products.find((p) => p.id === createForm.productId)
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: createForm.licenseKey,
          productId: createForm.productId,
          productName: product?.name || '',
          ownerDiscordId: createForm.ownerDiscordId,
          ownerDiscordUsername: createForm.ownerDiscordUsername,
          ownerUsername: createForm.ownerDiscordUsername,
          licensePlatform: createForm.licensePlatform,
          licensePlatformUserId: createForm.licensePlatformUserId,
          licenseType: createForm.licenseType,
          status: createForm.status,
          maxIps: createForm.maxIps,
          maxHwids: createForm.maxHwids,
          ips: createForm.ips ? createForm.ips.split(',').map((s) => s.trim()).filter(Boolean) : [],
          hwids: createForm.hwids ? createForm.hwids.split(',').map((s) => s.trim()).filter(Boolean) : [],
          notes: createForm.notes,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('License created successfully')
      mutate()
      setCreateForm({
        licenseKey: '',
        productId: '',
        ownerDiscordId: '',
        ownerDiscordUsername: '',
        licensePlatform: '',
        licensePlatformUserId: '',
        licenseType: 'PERMANENT',
        maxHwids: 5,
        maxIps: 5,
        ips: '',
        hwids: '',
        status: 'ACTIVE',
        notes: '',
      })
      setActiveTab('manage')
    } catch (err) {
      toast.error(String(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (license: License) => {
    setEditingLicense({ ...license })
    setEditOpen(true)
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLicense) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/licenses/${editingLicense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingLicense.product_id,
          productName: editingLicense.product_name,
          ownerDiscordId: editingLicense.owner_discord_id,
          ownerDiscordUsername: editingLicense.owner_discord_username,
          ownerUsername: editingLicense.owner_username,
          licensePlatform: editingLicense.license_platform,
          licensePlatformUserId: editingLicense.license_platform_user_id,
          licenseType: editingLicense.license_type,
          status: editingLicense.status,
          maxIps: editingLicense.max_ips,
          maxHwids: editingLicense.max_hwids,
          ips: editingLicense.ips,
          hwids: editingLicense.hwids,
          notes: editingLicense.notes,
          expiresAt: editingLicense.expiry_date,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('License updated successfully')
      mutate()
      setEditOpen(false)
    } catch (err) {
      toast.error(String(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('License deleted')
      mutate()
      setEditOpen(false)
    } catch (err) {
      toast.error(String(err))
    }
  }

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      ACTIVE: 'bg-green-500/20 text-green-400',
      EXPIRED: 'bg-red-500/20 text-red-400',
      INACTIVE: 'bg-slate-500/20 text-slate-400',
      BANNED: 'bg-orange-500/20 text-orange-400',
    }
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-semibold ${classes[status] || 'bg-slate-500/20 text-slate-400'}`}
      >
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-0">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex">
          <TabsList className="w-full rounded-none bg-slate-900 border-b border-slate-700 h-10 p-0">
            <TabsTrigger
              value="create"
              className="flex-1 rounded-none data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 h-full"
            >
              Create License
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="flex-1 rounded-none data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 h-full"
            >
              Manage Licenses
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Create Tab */}
        <TabsContent value="create" className="mt-0 p-6">
          <form onSubmit={handleCreate} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-slate-300">
                  License Key <span className="text-slate-400">•</span>
                </Label>
                <Input
                  value={createForm.licenseKey}
                  onChange={(e) => setCreateForm({ ...createForm, licenseKey: e.target.value })}
                  placeholder="Auto-generated or enter manually"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Product</Label>
                <Select
                  value={createForm.productId}
                  onValueChange={(v) => setCreateForm({ ...createForm, productId: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Owner Discord ID</Label>
                <Input
                  value={createForm.ownerDiscordId}
                  onChange={(e) => setCreateForm({ ...createForm, ownerDiscordId: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Owner Discord Username</Label>
                <Input
                  value={createForm.ownerDiscordUsername}
                  onChange={(e) => setCreateForm({ ...createForm, ownerDiscordUsername: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">License Platform</Label>
                <Select
                  value={createForm.licensePlatform}
                  onValueChange={(v) => setCreateForm({ ...createForm, licensePlatform: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Where you will sell this license" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {LICENSE_PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Where you will sell this license</p>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">License Platform User ID</Label>
                <Input
                  value={createForm.licensePlatformUserId}
                  onChange={(e) => setCreateForm({ ...createForm, licensePlatformUserId: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">License Type</Label>
                <Select
                  value={createForm.licenseType}
                  onValueChange={(v) => setCreateForm({ ...createForm, licenseType: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {LICENSE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">License Status</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(v) => setCreateForm({ ...createForm, status: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {LICENSE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Maximum IPs</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => setCreateForm({ ...createForm, maxIps: Math.max(-1, createForm.maxIps - 1) })}
                    className="border-slate-600 w-8 h-8 p-0">
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input type="number" value={createForm.maxIps}
                    onChange={(e) => setCreateForm({ ...createForm, maxIps: parseInt(e.target.value) || 0 })}
                    className="bg-slate-800 border-slate-600 text-white text-center w-24" />
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => setCreateForm({ ...createForm, maxIps: createForm.maxIps + 1 })}
                    className="border-slate-600 w-8 h-8 p-0">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Maximum HWIDs</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => setCreateForm({ ...createForm, maxHwids: Math.max(-1, createForm.maxHwids - 1) })}
                    className="border-slate-600 w-8 h-8 p-0">
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input type="number" value={createForm.maxHwids}
                    onChange={(e) => setCreateForm({ ...createForm, maxHwids: parseInt(e.target.value) || 0 })}
                    className="bg-slate-800 border-slate-600 text-white text-center w-24" />
                  <Button type="button" variant="outline" size="sm"
                    onClick={() => setCreateForm({ ...createForm, maxHwids: createForm.maxHwids + 1 })}
                    className="border-slate-600 w-8 h-8 p-0">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">IPs</Label>
                <Input placeholder="Comma-separated IP addresses" value={createForm.ips}
                  onChange={(e) => setCreateForm({ ...createForm, ips: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">HWIDs</Label>
                <Input placeholder="Comma-separated HWIDs" value={createForm.hwids}
                  onChange={(e) => setCreateForm({ ...createForm, hwids: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">Notes</Label>
              <Textarea value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white" rows={3} />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="border-slate-600"
                onClick={() => setCreateForm({ ...createForm, licenseKey: generateLicenseKey() })}>
                Generate Key
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-white text-black hover:bg-slate-100">
                {isSaving ? 'Creating...' : 'Create License'}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="mt-0">
          <div className="p-4 flex items-center gap-2 border-b border-slate-700">
            <Input
              placeholder="Search License..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white flex-1 max-w-sm"
            />
            <Button className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600" onClick={() => mutate()}>
              <Search className="w-4 h-4 mr-2" /> Search
            </Button>
            <Button variant="outline" className="border-slate-600" onClick={() => { setSearchTerm(''); mutate() }}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">License Key</TableHead>
                  <TableHead className="text-slate-300">Product Name</TableHead>
                  <TableHead className="text-slate-300">Owner Username</TableHead>
                  <TableHead className="text-slate-300">License Status</TableHead>
                  <TableHead className="text-slate-300">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">Loading...</TableCell>
                  </TableRow>
                ) : licenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">No licenses found</TableCell>
                  </TableRow>
                ) : (
                  licenses.map((license) => (
                    <TableRow key={license.id} className="border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => handleEdit(license)}>
                      <TableCell className="text-white font-mono text-sm">{license.license_key}</TableCell>
                      <TableCell className="text-slate-300">{license.product_name}</TableCell>
                      <TableCell className="text-slate-300">{license.owner_discord_username || ''}</TableCell>
                      <TableCell>{getStatusBadge(license.status)}</TableCell>
                      <TableCell className="text-slate-400 text-sm">{license.notes}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit License Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Edit License</DialogTitle>
          </DialogHeader>
          {editingLicense && (
            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300">License Key</Label>
                  <Input value={editingLicense.license_key} readOnly
                    className="bg-slate-700 border-slate-600 text-white font-mono opacity-70" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Product</Label>
                  <Select
                    value={editingLicense.product_id || ''}
                    onValueChange={(v) => {
                      const p = products.find((p) => p.id === v)
                      setEditingLicense({ ...editingLicense, product_id: v, product_name: p?.name || '' })
                    }}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Owner Discord ID</Label>
                  <Input value={editingLicense.owner_discord_id || ''}
                    onChange={(e) => setEditingLicense({ ...editingLicense, owner_discord_id: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Owner Discord Username</Label>
                  <Input value={editingLicense.owner_discord_username || ''}
                    onChange={(e) => setEditingLicense({ ...editingLicense, owner_discord_username: e.target.value, owner_username: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">License Platform</Label>
                  <Select value={editingLicense.license_platform || ''}
                    onValueChange={(v) => setEditingLicense({ ...editingLicense, license_platform: v })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {LICENSE_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">License Type</Label>
                  <Select value={editingLicense.license_type || 'PERMANENT'}
                    onValueChange={(v) => setEditingLicense({ ...editingLicense, license_type: v })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {LICENSE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Status</Label>
                  <Select value={editingLicense.status}
                    onValueChange={(v) => setEditingLicense({ ...editingLicense, status: v })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {LICENSE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Expiry Date</Label>
                  <Input type="datetime-local"
                    value={editingLicense.expiry_date ? editingLicense.expiry_date.substring(0, 16) : ''}
                    onChange={(e) => setEditingLicense({ ...editingLicense, expiry_date: e.target.value || null })}
                    className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Max IPs</Label>
                  <Input type="number" value={editingLicense.max_ips}
                    onChange={(e) => setEditingLicense({ ...editingLicense, max_ips: parseInt(e.target.value) || 0 })}
                    className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Max HWIDs</Label>
                  <Input type="number" value={editingLicense.max_hwids}
                    onChange={(e) => setEditingLicense({ ...editingLicense, max_hwids: parseInt(e.target.value) || 0 })}
                    className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">IPs (comma-separated)</Label>
                  <Input value={(editingLicense.ips || []).join(', ')}
                    onChange={(e) => setEditingLicense({ ...editingLicense, ips: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">HWIDs (comma-separated)</Label>
                  <Input value={(editingLicense.hwids || []).join(', ')}
                    onChange={(e) => setEditingLicense({ ...editingLicense, hwids: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="bg-slate-700 border-slate-600 text-white" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-slate-300">Notes</Label>
                  <Textarea value={editingLicense.notes || ''}
                    onChange={(e) => setEditingLicense({ ...editingLicense, notes: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white" rows={3} />
                </div>
              </div>
              <div className="flex gap-2 justify-between">
                <Button type="button" variant="destructive" onClick={() => handleDelete(editingLicense.id)}>
                  Delete License
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="border-slate-600">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
