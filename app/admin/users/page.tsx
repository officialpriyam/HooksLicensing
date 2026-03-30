'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Plus, Trash2, Edit2, Shield, ShieldCheck, ShieldAlert, X, Check } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type AdminUser,
  type Role,
} from '@/lib/auth-store'

const ROLES: { value: Role; label: string; color: string; icon: typeof Shield }[] = [
  { value: 'admin', label: 'Admin', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: ShieldAlert },
  { value: 'moderator', label: 'Moderator', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: ShieldCheck },
  { value: 'viewer', label: 'Viewer', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Shield },
]

function RoleBadge({ role }: { role: Role }) {
  const def = ROLES.find(r => r.value === role) || ROLES[2]
  const Icon = def.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${def.color}`}>
      <Icon className="w-3 h-3" />
      {def.label}
    </span>
  )
}

interface UserForm {
  username: string
  password: string
  role: Role
  discordId: string
}

const emptyForm: UserForm = { username: '', password: '', role: 'viewer', discordId: '' }

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [editForm, setEditForm] = useState<Partial<UserForm & { newPassword: string }>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    setUsers(getUsers())
  }, [])

  const refresh = () => setUsers(getUsers())

  const handleCreate = () => {
    if (!form.username.trim()) { toast.error('Username is required'); return }
    if (!form.password.trim()) { toast.error('Password is required'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    const existing = getUsers().find(u => u.username.toLowerCase() === form.username.toLowerCase())
    if (existing) { toast.error('Username already exists'); return }

    createUser({
      username: form.username.trim(),
      passwordHash: form.password.trim(), // auth-store prefixes "hash:"
      role: form.role,
      discordId: form.discordId.trim(),
      lastLogin: undefined,
    })
    toast.success(`User "${form.username}" created with role "${form.role}"`)
    setForm(emptyForm)
    setShowCreateForm(false)
    refresh()
  }

  const handleUpdate = () => {
    if (!editingUser) return
    const updates: Partial<AdminUser> = {}
    if (editForm.username?.trim()) updates.username = editForm.username.trim()
    if (editForm.role) updates.role = editForm.role
    if (editForm.discordId !== undefined) updates.discordId = editForm.discordId.trim()
    if (editForm.newPassword?.trim()) {
      if (editForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
      updates.passwordHash = `hash:${editForm.newPassword.trim()}`
    }
    updateUser(editingUser.id, updates)
    toast.success('User updated successfully')
    setEditingUser(null)
    setEditForm({})
    refresh()
  }

  const handleDelete = (id: string) => {
    const session = typeof window !== 'undefined' ? localStorage.getItem('hls_session') : null
    const currentUser = session ? JSON.parse(session) : null
    if (currentUser?.userId === id) {
      toast.error('You cannot delete your own account')
      return
    }
    deleteUser(id)
    toast.success('User deleted')
    setDeleteConfirm(null)
    refresh()
  }

  const openEdit = (user: AdminUser) => {
    setEditingUser(user)
    setEditForm({ username: user.username, role: user.role, discordId: user.discordId || '', newPassword: '' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Users &amp; Roles</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage admin users. Only users with the <strong className="text-red-400">Admin</strong> role can log in to this panel.
          </p>
        </div>
        <Button
          onClick={() => { setShowCreateForm(!showCreateForm); setForm(emptyForm) }}
          className="bg-white text-black hover:bg-slate-100 gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Role Legend */}
      <div className="flex gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        {ROLES.map(r => {
          const Icon = r.icon
          return (
            <div key={r.value} className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${r.color}`}>
                <Icon className="w-3 h-3" />
                {r.label}
              </span>
              <span className="text-slate-400 text-xs">
                {r.value === 'admin' && '— Full access, can log in'}
                {r.value === 'moderator' && '— Can manage content'}
                {r.value === 'viewer' && '— Read-only access'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Create New User</h3>
            <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-slate-300">Username <span className="text-red-400">*</span></Label>
              <Input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white"
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Password <span className="text-red-400">*</span></Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="bg-slate-900 border-slate-600 text-white pr-10"
                  placeholder="Min 6 characters"
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
            <div className="space-y-1">
              <Label className="text-slate-300">Role <span className="text-red-400">*</span></Label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-400"
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Discord User ID</Label>
              <Input
                value={form.discordId}
                onChange={e => setForm(f => ({ ...f, discordId: e.target.value }))}
                className="bg-slate-900 border-slate-600 text-white"
                placeholder="Optional Discord ID"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="bg-white text-black hover:bg-slate-100">
              Create User
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-transparent">
              <TableHead className="text-slate-300">Username</TableHead>
              <TableHead className="text-slate-300">Role</TableHead>
              <TableHead className="text-slate-300">Discord ID</TableHead>
              <TableHead className="text-slate-300">Created</TableHead>
              <TableHead className="text-slate-300">Last Login</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow className="border-slate-700">
                <TableCell colSpan={6} className="text-center py-8 text-slate-400">No users found</TableCell>
              </TableRow>
            )}
            {users.map(user => (
              <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/50">
                <TableCell className="text-white font-medium">{user.username}</TableCell>
                <TableCell><RoleBadge role={user.role} /></TableCell>
                <TableCell className="text-slate-400 text-sm font-mono">{user.discordId || '—'}</TableCell>
                <TableCell className="text-slate-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white hover:bg-slate-700 w-8 h-8"
                      onClick={() => openEdit(user)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    {deleteConfirm === user.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 w-8 h-8"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-white hover:bg-slate-700 w-8 h-8"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 w-8 h-8"
                        onClick={() => setDeleteConfirm(user.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1c1f26] border border-slate-700 rounded-lg p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Edit User</h3>
              <button onClick={() => { setEditingUser(null); setEditForm({}) }} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-slate-300">Username</Label>
                <Input
                  value={editForm.username ?? editingUser.username}
                  onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Role</Label>
                <select
                  value={editForm.role ?? editingUser.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-400"
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">Discord User ID</Label>
                <Input
                  value={editForm.discordId ?? (editingUser.discordId || '')}
                  onChange={e => setEditForm(f => ({ ...f, discordId: e.target.value }))}
                  className="bg-slate-900 border-slate-600 text-white"
                  placeholder="Optional Discord ID"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300">New Password <span className="text-slate-500">(leave blank to keep)</span></Label>
                <div className="relative">
                  <Input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editForm.newPassword ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white pr-10"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleUpdate} className="bg-white text-black hover:bg-slate-100 gap-1">
                <Check className="w-4 h-4" /> Update
              </Button>
              <Button
                variant="outline"
                onClick={() => { setEditingUser(null); setEditForm({}) }}
                className="border-slate-600 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
