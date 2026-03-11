import React, { useState } from 'react'
import { UserPlus, Trash2, Crown, User, X, Pencil, Check } from 'lucide-react'
import type { TeamMember } from '../../types'

const ROLES = ['admin', 'member'] as const
type Role = typeof ROLES[number]

export const MEMBER_COLORS = [
  '#0078d4', '#107c10', '#d83b01', '#8764b8', '#038387',
  '#ca5010', '#004b50', '#7a7574', '#e3008c', '#00b7c3',
]

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface TeamPanelProps {
  team: TeamMember[]
  currentUser: CurrentUser | null
  onAddMember: (memberData: Omit<TeamMember, 'id'>) => TeamMember
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void
  onRemoveMember: (id: string) => void
}

interface MemberForm {
  name: string
  email: string
  role: Role
  color: string
}

interface FormErrors {
  name?: string
  email?: string
}

function validateForm(form: MemberForm): FormErrors {
  const e: FormErrors = {}
  if (!form.name.trim()) e.name = 'Name is required'
  if (!form.email.trim()) e.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
  return e
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-outlook-text mb-1.5">Color</label>
      <div className="flex gap-2 flex-wrap">
        {MEMBER_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
            style={{
              backgroundColor: c,
              boxShadow: value === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined,
              transform: value === c ? 'scale(1.15)' : undefined,
            }}
            title={c}
          />
        ))}
      </div>
    </div>
  )
}

export default function TeamPanel({ team, currentUser, onAddMember, onUpdateMember, onRemoveMember }: TeamPanelProps) {
  const isAdmin = currentUser?.role === 'admin'

  const nextAvailableColor = () => {
    const used = team.map((m) => m.color)
    return MEMBER_COLORS.find((c) => !used.includes(c)) ?? MEMBER_COLORS[0]
  }

  const emptyAddForm = (): MemberForm => ({ name: '', email: '', role: 'member', color: nextAvailableColor() })

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<MemberForm>(emptyAddForm)
  const [addErrors, setAddErrors] = useState<FormErrors>({})

  // Edit form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<MemberForm>({ name: '', email: '', role: 'member', color: MEMBER_COLORS[0] })
  const [editErrors, setEditErrors] = useState<FormErrors>({})

  const setAdd = <K extends keyof MemberForm>(field: K, val: MemberForm[K]) =>
    setAddForm((f) => ({ ...f, [field]: val }))

  const setEdit = <K extends keyof MemberForm>(field: K, val: MemberForm[K]) =>
    setEditForm((f) => ({ ...f, [field]: val }))

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateForm(addForm)
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return }
    onAddMember({ name: addForm.name.trim(), email: addForm.email.trim(), role: addForm.role, color: addForm.color })
    setAddForm(emptyAddForm())
    setShowAddForm(false)
    setAddErrors({})
  }

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id)
    setEditForm({ name: member.name, email: member.email, role: (member.role as Role) ?? 'member', color: member.color ?? MEMBER_COLORS[0] })
    setEditErrors({})
  }

  const cancelEdit = () => { setEditingId(null); setEditErrors({}) }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateForm(editForm)
    if (Object.keys(errors).length > 0) { setEditErrors(errors); return }
    if (editingId) {
      onUpdateMember(editingId, { name: editForm.name.trim(), email: editForm.email.trim(), role: editForm.role, color: editForm.color })
    }
    setEditingId(null)
    setEditErrors({})
  }

  const handleRemove = (id: string) => {
    if (id === currentUser?.id) { alert('You cannot remove yourself.'); return }
    if (window.confirm('Remove this team member?')) onRemoveMember(id)
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
              onClick={() => {
                if (!showAddForm) setAddForm(emptyAddForm())
                setShowAddForm(!showAddForm)
                setEditingId(null)
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-outlook-blue text-white text-sm font-medium rounded hover:bg-outlook-blue-hover transition-colors"
            >
              <UserPlus size={15} />
              Add Member
            </button>
          )}
        </div>

        {/* Add member form */}
        {showAddForm && isAdmin && (
          <div className="bg-white border border-outlook-border rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* Live avatar preview */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 transition-colors"
                  style={{ backgroundColor: addForm.color }}
                >
                  {addForm.name.charAt(0).toUpperCase() || '?'}
                </div>
                <h3 className="text-sm font-semibold text-outlook-text">New Team Member</h3>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-outlook-gray rounded">
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
                    value={addForm.name}
                    onChange={(e) => setAdd('name', e.target.value)}
                    autoFocus
                    className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                      ${addErrors.name ? 'border-red-400' : 'border-outlook-border'}`}
                    placeholder="Full name"
                  />
                  {addErrors.name && <p className="text-red-500 text-xs mt-0.5">{addErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-outlook-text mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAdd('email', e.target.value)}
                    className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                      ${addErrors.email ? 'border-red-400' : 'border-outlook-border'}`}
                    placeholder="email@company.com"
                  />
                  {addErrors.email && <p className="text-red-500 text-xs mt-0.5">{addErrors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-outlook-text mb-1">Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAdd('role', e.target.value as Role)}
                  className="border border-outlook-border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <ColorPicker value={addForm.color} onChange={(c) => setAdd('color', c)} />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
              {team.map((member) =>
                editingId === member.id ? (
                  /* ── Inline edit row ── */
                  <li key={member.id} className="px-6 py-4 bg-outlook-blue-light/30">
                    <form onSubmit={handleSaveEdit} className="space-y-3">
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 transition-colors"
                          style={{ backgroundColor: editForm.color }}
                        >
                          {editForm.name.charAt(0).toUpperCase() || member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-outlook-text-light">Editing member</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-outlook-text mb-1">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEdit('name', e.target.value)}
                            autoFocus
                            className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                              ${editErrors.name ? 'border-red-400' : 'border-outlook-border'}`}
                          />
                          {editErrors.name && <p className="text-red-500 text-xs mt-0.5">{editErrors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-outlook-text mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEdit('email', e.target.value)}
                            className={`w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                              ${editErrors.email ? 'border-red-400' : 'border-outlook-border'}`}
                          />
                          {editErrors.email && <p className="text-red-500 text-xs mt-0.5">{editErrors.email}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-outlook-text mb-1">Role</label>
                        <select
                          value={editForm.role}
                          onChange={(e) => setEdit('role', e.target.value as Role)}
                          className="border border-outlook-border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <ColorPicker value={editForm.color} onChange={(c) => setEdit('color', c)} />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-sm border border-outlook-border rounded hover:bg-outlook-gray"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-outlook-blue text-white rounded hover:bg-outlook-blue-hover"
                        >
                          <Check size={13} />
                          Save
                        </button>
                      </div>
                    </form>
                  </li>
                ) : (
                  /* ── Normal display row ── */
                  <li key={member.id} className="flex items-center gap-4 px-6 py-3 hover:bg-outlook-gray/50 group">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: member.color || '#a19f9d' }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-outlook-text truncate">{member.name}</span>
                        {member.id === currentUser?.id && (
                          <span className="text-[10px] bg-outlook-blue-light text-outlook-blue px-1.5 py-0.5 rounded font-medium">You</span>
                        )}
                      </div>
                      <span className="text-xs text-outlook-text-muted">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-outlook-text-muted">
                        {member.role === 'admin' ? <Crown size={12} className="text-outlook-blue" /> : <User size={12} />}
                        <span className="capitalize">{member.role}</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => startEdit(member)}
                          className="p-1.5 text-outlook-text-muted hover:text-outlook-blue hover:bg-outlook-blue-light rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit member"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {isAdmin && member.id !== currentUser?.id && (
                        <button
                          onClick={() => handleRemove(member.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
