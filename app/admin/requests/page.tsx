'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, RefreshCw, Copy } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Request = {
  id: string
  license_key: string
  product_name: string
  product_id: string
  request_date: string
  status: string
  ip_address: string
  hwid: string
  mac_address: string
  operating_system: string
  os_version: string
  os_architecture: string
  java_version: string
  request_type: string
  response_type: string
  product_version: string
}

type Product = { id: string; name: string }

function getStatusBadge(status: string) {
  if (status === 'Successful') {
    return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-400">{status}</span>
  }
  if (status === 'HWID blacklisted' || status === 'IP blacklisted') {
    return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400">{status}</span>
  }
  return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/20 text-slate-400">{status}</span>
}

export default function RequestsPage() {
  const [search, setSearch] = useState('')
  const [productFilter, setProductFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (productFilter !== 'all') params.set('productId', productFilter)
  if (fromDate) params.set('from', fromDate)
  if (toDate) params.set('to', toDate)

  const { data, mutate, isLoading } = useSWR(
    `/api/admin/requests?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  const requests: Request[] = Array.isArray(data) ? data : []

  const { data: productsData } = useSWR('/api/admin/products', fetcher, { revalidateOnFocus: false })
  const products: Product[] = Array.isArray(productsData) ? productsData : []

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-0">
      {/* Filters */}
      <div className="p-4 border-b border-slate-700 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px] space-y-1">
          <Label className="text-slate-400 text-xs">Search</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by license key..."
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600" onClick={() => mutate()}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            className="border-slate-600"
            onClick={() => {
              setSearch('')
              setProductFilter('all')
              setFromDate('')
              setToDate('')
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-slate-400 text-xs">Product</Label>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="all">All Products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-slate-400 text-xs">
            From Date <span className="text-slate-500">•</span>
          </Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-400 text-xs">
            To Date <span className="text-slate-500">•</span>
          </Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-slate-800 border-slate-600 text-white w-40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-300">License Key</TableHead>
              <TableHead className="text-slate-300">Product</TableHead>
              <TableHead className="text-slate-300">Date</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                  Loading requests...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow
                  key={request.id}
                  className="border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                  onClick={() => {
                    setSelectedRequest(request)
                    setDetailOpen(true)
                  }}
                >
                  <TableCell className="text-white font-mono text-sm">
                    {request.license_key}
                  </TableCell>
                  <TableCell className="text-slate-300">{request.product_name}</TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {new Date(request.request_date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Request Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">License Key</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm flex items-center gap-2">
                    <Copy
                      className="w-3 h-3 text-slate-400 cursor-pointer"
                      onClick={() => copyToClipboard(selectedRequest.license_key)}
                    />
                    {selectedRequest.license_key}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Product Version</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.product_version || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">IP Address</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm">
                  {selectedRequest.ip_address || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">HWID</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.hwid || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">MAC Address</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm">
                  {selectedRequest.mac_address || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Operating System</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.operating_system || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">OS Version</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.os_version || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">OS Architecture</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.os_architecture || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Java Version</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.java_version || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Request Type</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.request_type || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Response Type</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {selectedRequest.response_type || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Request Date</Label>
                <div className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm">
                  {new Date(selectedRequest.request_date).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
