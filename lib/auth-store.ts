/**
 * Hook License System - Auth Store
 *
 * DATABASE: This project currently uses IN-MEMORY / LOCAL STORAGE data.
 * There is NO external database connected. All users, roles, and settings
 * are stored in the browser's localStorage and reset on server restart.
 *
 * To connect a real database, integrate Neon or Supabase via the integrations
 * panel and replace the functions below with real DB queries.
 *
 * DEFAULT ADMIN CREDENTIALS:
 *   Username: admin
 *   Password: admin123
 *   Role: admin
 */

export type Role = 'admin' | 'moderator' | 'viewer'

export interface AdminUser {
  id: string
  username: string
  passwordHash: string   // bcrypt-style; for demo we use plain prefix "hash:"
  role: Role
  discordId?: string
  createdAt: string
  lastLogin?: string
}

export interface OAuthSettings {
  discordClientId: string
  discordClientSecret: string
  discordRedirectUri: string
  enableDiscordLogin: boolean
  adminDiscordRoleId: string  // Only users with this Discord role ID can log in
}

// Default seed data — stored in localStorage key "hls_users"
const DEFAULT_USERS: AdminUser[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: 'hash:admin123',
    role: 'admin',
    discordId: '',
    createdAt: '2025-01-01 00:00:00',
    lastLogin: new Date().toISOString(),
  },
]

const DEFAULT_OAUTH: OAuthSettings = {
  discordClientId: '',
  discordClientSecret: '',
  discordRedirectUri: '',
  enableDiscordLogin: false,
  adminDiscordRoleId: '',
}

// --- Storage helpers (client-side only) ---

function loadUsers(): AdminUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS
  try {
    const stored = localStorage.getItem('hls_users')
    if (stored) return JSON.parse(stored)
  } catch {}
  return DEFAULT_USERS
}

function saveUsers(users: AdminUser[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('hls_users', JSON.stringify(users))
}

export function loadOAuthSettings(): OAuthSettings {
  if (typeof window === 'undefined') return DEFAULT_OAUTH
  try {
    const stored = localStorage.getItem('hls_oauth')
    if (stored) return { ...DEFAULT_OAUTH, ...JSON.parse(stored) }
  } catch {}
  return DEFAULT_OAUTH
}

export function saveOAuthSettings(settings: OAuthSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem('hls_oauth', JSON.stringify(settings))
}

// --- User management ---

export function getUsers(): AdminUser[] {
  return loadUsers()
}

export function getUserByUsername(username: string): AdminUser | undefined {
  return loadUsers().find(u => u.username.toLowerCase() === username.toLowerCase())
}

export function verifyPassword(user: AdminUser, password: string): boolean {
  // Demo hash format: "hash:<plaintext>"
  return user.passwordHash === `hash:${password}`
}

export function createUser(data: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser {
  const users = loadUsers()
  const newUser: AdminUser = {
    ...data,
    id: String(Date.now()),
    passwordHash: `hash:${data.passwordHash}`, // in real app: bcrypt.hash()
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  saveUsers(users)
  return newUser
}

export function updateUser(id: string, updates: Partial<AdminUser>): AdminUser | null {
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...updates }
  saveUsers(users)
  return users[idx]
}

export function deleteUser(id: string): boolean {
  const users = loadUsers()
  const filtered = users.filter(u => u.id !== id)
  if (filtered.length === users.length) return false
  saveUsers(filtered)
  return true
}

export function updateLastLogin(id: string) {
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === id)
  if (idx !== -1) {
    users[idx].lastLogin = new Date().toISOString()
    saveUsers(users)
  }
}

// --- Session helpers ---

export interface Session {
  userId: string
  username: string
  role: Role
  token: string
}

export function createSession(user: AdminUser): Session {
  const token = btoa(`${user.id}:${user.username}:${Date.now()}`)
  const session: Session = { userId: user.id, username: user.username, role: user.role, token }
  if (typeof window !== 'undefined') {
    localStorage.setItem('hls_session', JSON.stringify(session))
  }
  return session
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('hls_session')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hls_session')
    localStorage.removeItem('adminToken')
  }
}
