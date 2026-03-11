import React, { useState } from 'react'
import { UserPlus, Trash2, Crown, User, X } from 'lucide-react'
import type { TeamMember } from '../../types'

const ROLES = ['admin', 'member'] as const
type Role = typeof ROLES[number]

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface TeamPanelProps {
  team: TeamMember[]
  currentUser: CurrentUser | null
  onAddMember: (memberData: Omit<TeamMember, 'id' | 'color'>) => TeamMember
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void
  onRemoveMember: (id: string) => void
}

interface MemberForm {
  name: string
  email: string
  role: Role
}

interface FormErrors {
  name?: string
  email?: string
}

export default function TeamPanel({ team, currentUser, onAddMember, onUpdateMember, onRemoveMember }: TeamPanelProps) {
  const isAdmin = currentUser?.role === 'admin'
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<MemberForm>({ name: '', email: '', role: 'member' })
  const [errors, setErrors] = useState<FormErrors>({})

  const set = <K extends keyof MemberForm>(field: K, val: MemberForm[K]) => setForm((f) => ({ ...f, [field]: val }))

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onAddMember({ name: form.name.trim(), email: form.email.trim(), role: form.role })
    setForm({ name: '', email: '', role: 'member' })
    setShowForm(false)
    setErrors({})
  }

  const handleRoleChange = (id: string, role: string) => {
    onUpdateMember(id, { role: role as Role })
  }

  const handleRemove = (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot remove yourself.')
      return
    }
    if (window.confirm('Remove this team member?')) {
      onRemoveMember(id)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-outlook-text">Team Members</h1>
            <p className="text-sm text-outlook-text-muted mt-0.5">{team.length} member{team.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-2 bg-outlook-blue text-white text-sm font-medium rounded hover:bg-outlook-blue-hover transition-colors"
            >
              <UserPlus size={15} />
              Add Member
            </button>
          )}
        </div>

        {/* Add member form */}
        {showForm && isAdmin && (
          <div className="bg-white border border-outlook-border rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-outlook-text">New Team Member</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-outlook-gray rounded">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-outlook-text mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                      ${errors.name ? 'border-red-400' : 'border-outlook-border'}`}
                    placeholder="Full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-outlook-text mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                      ${errors.email ? 'border-red-400' : 'border-outlook-border'}`}
                    placeholder="email@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-outlook-text mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value as Role)}
                  className="border border-outlook-border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 text-sm border border-outlook-border rounded hover:bg-outlook-gray"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-outlook-blue text-white rounded hover:bg-outlook-blue-hover"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Team list */}
        <div className="bg-white border border-outlook-border rounded-lg overflow-hidden shadow-sm">
          {team.length === 0 ? (
            <div className="px-6 py-8 text-center text-outlook-text-muted text-sm">
              No team members yet.
            </div>
          ) : (
            <ul className="divide-y divide-outlook-border">
              {team.map((member) => (
                <li key={member.id} className="flex items-center gap-4 px-6 py-3 hover:bg-outlook-gray/50">
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: member.color || '#a19f9d' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-outlook-text truncate">{member.name}</span>
                      {member.id === currentUser?.id && (
                        <span className="text-[10px] bg-outlook-blue-light text-outlook-blue px-1.5 py-0.5 rounded font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-outlook-text-muted">{member.email}</span>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2">
                    {isAdmin && member.id !== currentUser?.id ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="text-xs border border-outlook-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-outlook-blue"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-outlook-text-muted">
                        {member.role === 'admin' ? (
                          <Crown size={12} className="text-outlook-blue" />
                        ) : (
                          <User size={12} />
                        )}
                        <span className="capitalize">{member.role}</span>
                      </div>
                    )}

                    {isAdmin && member.id !== currentUser?.id && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove member"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
