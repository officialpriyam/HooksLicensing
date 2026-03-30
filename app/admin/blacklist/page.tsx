'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type BlacklistEntry = {
  id: string
  license_data_type: string
  data: string
  is_for_all_products: boolean
  product_id: string | null
  reason: string
  created_at: string
  updated_at: string
}

type Product = { id: string; name: string }

export default function BlacklistPage() {
  const { data, mutate, isLoading } = useSWR('/api/admin/blacklists', fetcher, { revalidateOnFocus: false })
  const blacklist: BlacklistEntry[] = Array.isArray(data) ? data : []

  const { data: productsData } = useSWR('/api/admin/products', fetcher, { revalidateOnFocus: false })
  const products: Product[] = Array.isArray(productsData) ? productsData : []

  const [activeTab, setActiveTab] = useState('manage')

  const [createForm, setCreateForm] = useState({
    type: '',
    data: '',
    forAllProducts: 'ALL_PRODUCTS',
    productId: '',
    reason: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.type || !createForm.data) {
      toast.error('Type and data are required')
      return
    }
    try {
      const res = await fetch('/api/admin/blacklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: createForm.type,
          data: createForm.data,
          forAllProducts: createForm.forAllProducts === 'ALL_PRODUCTS',
          productId: createForm.forAllProducts === 'ALL_PRODUCTS' ? '' : createForm.productId,
          reason: createForm.reason,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Blacklist entry created')
      mutate()
      setCreateForm({ type: '', data: '', forAllProducts: 'ALL_PRODUCTS', productId: '', reason: '' })
      setActiveTab('manage')
    } catch (err) {
      toast.error(String(err))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blacklists/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Entry deleted')
      mutate()
    } catch (err) {
      toast.error(String(err))
    }
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
              Create Blacklist
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="flex-1 rounded-none data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 h-full"
            >
              Manage Blacklists
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Create Tab */}
        <TabsContent value="create" className="mt-0 p-6">
          <form onSubmit={handleCreate} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-slate-300">
                  Type <span className="text-slate-400">•</span>
                </Label>
                <Select
                  value={createForm.type}
                  onValueChange={(v) => setCreateForm({ ...createForm, type: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="HWID">HWID</SelectItem>
                    <SelectItem value="IP">IP</SelectItem>
                    <SelectItem value="USERNAME">USERNAME</SelectItem>
                    <SelectItem value="DISCORD_ID">DISCORD_ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">
                  Data <span className="text-slate-400">•</span>
                </Label>
                <Input
                  value={createForm.data}
                  onChange={(e) => setCreateForm({ ...createForm, data: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-300">
                For <span className="text-slate-400">•</span>
              </Label>
              <Select
                value={createForm.forAllProducts}
                onValueChange={(v) => setCreateForm({ ...createForm, forAllProducts: v })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="ALL_PRODUCTS">All Products</SelectItem>
                  <SelectItem value="SPECIFIC_PRODUCT">Specific Product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createForm.forAllProducts === 'SPECIFIC_PRODUCT' && (
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
            )}

            <div className="space-y-1">
              <Label className="text-slate-300">Reason</Label>
              <Textarea
                value={createForm.reason}
                onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
                className="bg-slate-800 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <Button type="submit" className="bg-white text-black hover:bg-slate-100 px-12">
              Save
            </Button>
          </form>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="mt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">Id</TableHead>
                  <TableHead className="text-slate-300">License Data Type</TableHead>
                  <TableHead className="text-slate-300">Data</TableHead>
                  <TableHead className="text-slate-300">For All Products</TableHead>
                  <TableHead className="text-slate-300">Product Id</TableHead>
                  <TableHead className="text-slate-300">Reason</TableHead>
                  <TableHead className="text-slate-300">Created At</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : blacklist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                      Blacklist is empty
                    </TableCell>
                  </TableRow>
                ) : (
                  blacklist.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-slate-700 hover:bg-slate-700/50"
                    >
                      <TableCell className="text-slate-300 text-xs">{entry.id}</TableCell>
                      <TableCell className="text-slate-300">{entry.license_data_type}</TableCell>
                      <TableCell className="text-white font-mono text-sm">{entry.data}</TableCell>
                      <TableCell className="text-slate-300">
                        {String(entry.is_for_all_products)}
                      </TableCell>
                      <TableCell className="text-slate-400">{entry.product_id ?? '—'}</TableCell>
                      <TableCell className="text-slate-400 max-w-[120px] truncate">{entry.reason}</TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {new Date(entry.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
