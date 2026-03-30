'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import useSWR from 'swr'
import { getDiscordAvatar } from '@/lib/mock-data'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Customer = {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  discord_id: string
  discord_username: string
  builtbybit_id: string
  builtbybit_username: string
  notes: string
  status: string
  licenseCount: number
  totalRequests: number
}

export default function CustomersPage() {
  const { data, mutate, isLoading } = useSWR('/api/admin/customers', fetcher, { revalidateOnFocus: false })
  const customers: Customer[] = Array.isArray(data) ? data : []

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleRowClick = (customer: Customer) => {
    setEditingCustomer({ ...customer })
    setEditOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editingCustomer.username,
          firstName: editingCustomer.first_name,
          lastName: editingCustomer.last_name,
          email: editingCustomer.email,
          discordId: editingCustomer.discord_id,
          discordUsername: editingCustomer.discord_username,
          builtbybitId: editingCustomer.builtbybit_id,
          builtbybitUsername: editingCustomer.builtbybit_username,
          notes: editingCustomer.notes,
          status: editingCustomer.status,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Customer updated')
      mutate()
      setEditOpen(false)
    } catch (err) {
      toast.error(String(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutate()}
          className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-300">Profile Picture</TableHead>
              <TableHead className="text-slate-300">Username</TableHead>
              <TableHead className="text-slate-300">Discord Username</TableHead>
              <TableHead className="text-slate-300">BuiltByBit User Id</TableHead>
              <TableHead className="text-slate-300">License Count</TableHead>
              <TableHead className="text-slate-300">Total Requests</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                  onClick={() => handleRowClick(customer)}
                >
                  <TableCell>
                    <img
                      src={getDiscordAvatar(customer.discord_id || '')}
                      alt={customer.discord_username}
                      className="w-10 h-10 rounded-full object-cover bg-slate-700"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.discord_username || customer.username || 'U')}&background=334155&color=fff&size=80`
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-slate-300">{customer.username}</TableCell>
                  <TableCell className="text-slate-300">{customer.discord_username}</TableCell>
                  <TableCell className="text-slate-400">{customer.builtbybit_id}</TableCell>
                  <TableCell className="text-slate-300">{customer.licenseCount ?? 0}</TableCell>
                  <TableCell className="text-slate-300">{customer.totalRequests ?? 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Customer Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          {editingCustomer && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex justify-center mb-2">
                <img
                  src={getDiscordAvatar(editingCustomer.discord_id || '')}
                  alt={editingCustomer.discord_username}
                  className="w-24 h-24 rounded-full object-cover border-2 border-slate-600 bg-slate-700"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editingCustomer.discord_username || 'U')}&background=334155&color=fff&size=100`
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-slate-300">Username</Label>
                  <Input
                    value={editingCustomer.username || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, username: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">First Name</Label>
                  <Input
                    value={editingCustomer.first_name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, first_name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Last Name</Label>
                  <Input
                    value={editingCustomer.last_name || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, last_name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Email</Label>
                  <Input
                    value={editingCustomer.email || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Discord ID</Label>
                  <Input
                    value={editingCustomer.discord_id || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, discord_id: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Discord Username</Label>
                  <Input
                    value={editingCustomer.discord_username || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, discord_username: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">BuiltByBit ID</Label>
                  <Input
                    value={editingCustomer.builtbybit_id || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, builtbybit_id: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">BuiltByBit Username</Label>
                  <Input
                    value={editingCustomer.builtbybit_username || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, builtbybit_username: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-slate-300">Notes</Label>
                  <Textarea
                    value={editingCustomer.notes || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300">Status</Label>
                  <Select
                    value={editingCustomer.status}
                    onValueChange={(v) => setEditingCustomer({ ...editingCustomer, status: v })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="BANNED">BANNED</SelectItem>
                      <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSaving} className="bg-white text-black hover:bg-slate-100">
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
