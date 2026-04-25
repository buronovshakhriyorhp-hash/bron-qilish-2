'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ShieldAlert, ShieldCheck, User } from 'lucide-react'

type RoleType = 'all' | 'user' | 'business_owner' | 'admin'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filter, setFilter] = useState<RoleType>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadUsers = useCallback(async (r: RoleType) => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?role=${r}`)
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers(filter) }, [filter, loadUsers])

  const handleRoleChange = async (id: string, newRole: string) => {
    if (!window.confirm("Foydalanuvchi huquqini o'zgartirishni xohlaysizmi?")) return
    
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u =>
          u.id === id ? { ...u, role: newRole } : u
        ))
      } else {
        const errorData = await res.json()
        alert(errorData.error || "Xatolik yuz berdi")
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u => {
    const term = search.toLowerCase()
    return (
      (u.full_name || '').toLowerCase().includes(term) ||
      (u.phone || '').includes(term)
    )
  })

  const FILTERS: { value: RoleType; label: string }[] = [
    { value: 'all', label: 'Barchasi' },
    { value: 'user', label: 'Foydalanuvchilar' },
    { value: 'business_owner', label: 'Biznes egalari' },
    { value: 'admin', label: 'Adminlar' },
  ]

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-50 text-red-700 rounded-lg font-bold"><ShieldAlert size={12} /> Admin</span>
      case 'business_owner': return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg font-semibold"><ShieldCheck size={12} /> Biznes egasi</span>
      case 'user': return <span className="flex items-center gap-1 text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium"><User size={12} /> User</span>
      default: return <span>{role}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Foydalanuvchilar</h1>
        <p className="text-slate-400 text-sm mt-0.5">Tizimdagi barcha foydalanuvchilar va ularning huquqlari</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ism yoki telefon..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === f.value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <div>Foydalanuvchi</div>
          <div>Telefon</div>
          <div>Joriy Huquq</div>
          <div>Huquqni O'zgartirish</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            Hech narsa topilmadi
          </div>
        ) : (
          filtered.map((u, i) => (
            <div
              key={u.id}
              className={`grid grid-cols-[1.5fr_1fr_1fr_1fr] px-5 py-4 items-center gap-3 ${i < filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{u.full_name || '—'}</p>
                <p className="text-xs text-slate-400 truncate">Qo'shildi: {new Date(u.created_at).toLocaleDateString('uz-UZ')}</p>
              </div>
              <div className="text-sm text-slate-600 font-mono">
                {u.phone || '—'}
              </div>
              <div className="flex">
                {getRoleLabel(u.role)}
              </div>
              <div className="flex gap-1.5">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={actionLoading === u.id}
                  className="w-full max-w-[150px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="user">User</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
