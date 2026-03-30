'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { RefreshCw, ExternalLink } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProductsPage() {
  const { data: products = [], mutate } = useSWR('/api/admin/products', fetcher, { revalidateOnFocus: false })
  const [activeTab, setActiveTab] = useState('manage')
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    product_type: 'OTHER',
    other_product_type: '',
    role_id: '',
    purchase_role_id: '',
    default_max_ips: 5,
    default_max_hwids: 5,
    product_url: '',
    product_image_url: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name.trim()) { toast.error('Product name is required'); return }
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createForm) })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Product created')
      mutate()
      setCreateForm({ name: '', description: '', product_type: 'OTHER', other_product_type: '', role_id: '', purchase_role_id: '', default_max_ips: 5, default_max_hwids: 5, product_url: '', product_image_url: '' })
      setActiveTab('manage')
    } catch (err) { toast.error(String(err)) } finally { setIsSaving(false) }
  }

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingProduct) })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Product updated')
      mutate()
      setEditOpen(false)
    } catch (err) { toast.error(String(err)) } finally { setIsSaving(false) }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    try {
      await Promise.all([...selectedIds].map(id => fetch(`/api/admin/products/${id}`, { method: 'DELETE' })))
      setSelectedIds(new Set())
      toast.success(`${selectedIds.size} product(s) deleted`)
      mutate()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="manage">Manage Products</TabsTrigger>
          <TabsTrigger value="create">Create Products</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            {selectedIds.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                Delete {selectedIds.size} Product{selectedIds.size !== 1 ? 's' : ''}
              </Button>
            )}
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-750">
                <TableRow className="border-slate-700">
                  <TableHead className="w-8"><input type="checkbox" /></TableHead>
                  <TableHead className="text-slate-300">Image</TableHead>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Max IPs</TableHead>
                  <TableHead className="text-slate-300">Max HWIDs</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p: any) => (
                  <TableRow key={p.id} className="border-slate-700 hover:bg-slate-750">
                    <TableCell><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => { const next = new Set(selectedIds); if (next.has(p.id)) next.delete(p.id); else next.add(p.id); setSelectedIds(next) }} /></TableCell>
                    <TableCell>
                      {p.product_image_url ? <img src={p.product_image_url} alt={p.name} className="w-12 h-9 object-cover rounded" /> : <div className="w-12 h-9 bg-slate-700 rounded text-xs flex items-center justify-center text-slate-500">No img</div>}
                    </TableCell>
                    <TableCell className="font-medium text-white">{p.name} {p.product_url && <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 inline ml-2"><ExternalLink className="w-3 h-3" /></a>}</TableCell>
                    <TableCell className="text-slate-300">{p.product_type}</TableCell>
                    <TableCell className="text-center text-slate-300">{p.default_max_ips}</TableCell>
                    <TableCell className="text-center text-slate-300">{p.default_max_hwids}</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => { setEditingProduct({ ...p }); setEditOpen(true) }} className="text-blue-400 hover:bg-slate-700">Edit</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4 mt-4">
          <form onSubmit={handleCreate} className="space-y-4 max-w-2xl bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div><Label className="text-slate-300">Name *</Label><Input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><Label className="text-slate-300">Description</Label><Textarea value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><Label className="text-slate-300">Product Type</Label><Input value={createForm.product_type} onChange={e => setCreateForm({ ...createForm, product_type: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><Label className="text-slate-300">Default Max IPs</Label><Input type="number" value={createForm.default_max_ips} onChange={e => setCreateForm({ ...createForm, default_max_ips: parseInt(e.target.value) || 0 })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><Label className="text-slate-300">Default Max HWIDs</Label><Input type="number" value={createForm.default_max_hwids} onChange={e => setCreateForm({ ...createForm, default_max_hwids: parseInt(e.target.value) || 0 })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><Label className="text-slate-300">Product URL</Label><Input value={createForm.product_url} onChange={e => setCreateForm({ ...createForm, product_url: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <div><Label className="text-slate-300">Image URL</Label><Input value={createForm.product_image_url} onChange={e => setCreateForm({ ...createForm, product_image_url: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
            <Button type="submit" disabled={isSaving} className="w-full bg-amber-600 hover:bg-amber-700">{isSaving ? 'Creating...' : 'Create Product'}</Button>
          </form>
        </TabsContent>
      </Tabs>

      {editOpen && editingProduct && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
            <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div><Label>Name</Label><Input value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
              <div><Label>Description</Label><Textarea value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
              <div><Label>Type</Label><Input value={editingProduct.product_type} onChange={e => setEditingProduct({ ...editingProduct, product_type: e.target.value })} className="bg-slate-700 border-slate-600 text-white" /></div>
              <div><Label>Max IPs</Label><Input type="number" value={editingProduct.default_max_ips} onChange={e => setEditingProduct({ ...editingProduct, default_max_ips: parseInt(e.target.value) || 0 })} className="bg-slate-700 border-slate-600 text-white" /></div>
              <div><Label>Max HWIDs</Label><Input type="number" value={editingProduct.default_max_hwids} onChange={e => setEditingProduct({ ...editingProduct, default_max_hwids: parseInt(e.target.value) || 0 })} className="bg-slate-700 border-slate-600 text-white" /></div>
              <div className="flex gap-2 justify-end"><Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="border-slate-600">Cancel</Button><Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">{isSaving ? 'Saving...' : 'Save'}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
