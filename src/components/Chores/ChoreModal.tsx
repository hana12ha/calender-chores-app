import React, { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import RecurrenceSelector from './RecurrenceSelector'
import type { Chore, TeamMember } from '../../types'

type ChoreFormData = Omit<Chore, 'id' | 'rotationIndex' | 'createdBy'> & {
  id?: string
  rotationIndex?: number
  createdBy?: string
}

const UNASSIGNED_COLOR = '#a19f9d'

const defaultChore: ChoreFormData = {
  title: '',
  description: '',
  dueDate: format(new Date(), 'yyyy-MM-dd'),
  dueTime: '09:00',
  isRecurring: false,
  recurrenceDays: [],
  recurrenceEndDate: '',
  assignedTo: null,
  autoRotate: false,
  color: UNASSIGNED_COLOR,
}

interface ChoreModalProps {
  chore: Chore | null
  team: TeamMember[]
  onSave: (formData: ChoreFormData) => void
  onDelete: (id: string) => void
  onClose: () => void
}

interface FormErrors {
  title?: string
  dueDate?: string
  recurrenceDays?: string
}

export default function ChoreModal({ chore, team, onSave, onDelete, onClose }: ChoreModalProps) {
  const isEdit = !!chore?.id
  const [form, setForm] = useState<ChoreFormData>(isEdit ? { ...chore } : { ...defaultChore })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (chore) setForm({ ...defaultChore, ...chore })
    else setForm({ ...defaultChore, dueDate: format(new Date(), 'yyyy-MM-dd') })
  }, [chore])

  const set = <K extends keyof ChoreFormData>(field: K, value: ChoreFormData[K]) =>
    setForm((f) => ({ ...f, [field]: value }))

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.dueDate) e.dueDate = 'Due date is required'
    if (form.isRecurring && form.recurrenceDays.length === 0) {
      e.recurrenceDays = 'Select at least one day'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSave({
      ...form,
      assignedTo: form.assignedTo || null,
      recurrenceEndDate: form.recurrenceEndDate || '',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outlook-border">
          <h2 className="text-lg font-semibold text-outlook-text">
            {isEdit ? 'Edit Chore' : 'New Chore'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-outlook-gray text-outlook-text-light">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-outlook-text mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                ${errors.title ? 'border-red-400' : 'border-outlook-border'}`}
              placeholder="e.g. Clean kitchen"
              autoFocus
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-outlook-text mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              className="w-full border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue resize-none"
              placeholder="Optional details..."
            />
          </div>

          {/* Due date + time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-outlook-text mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue
                  ${errors.dueDate ? 'border-red-400' : 'border-outlook-border'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-outlook-text mb-1">Time</label>
              <input
                type="time"
                value={form.dueTime}
                onChange={(e) => set('dueTime', e.target.value)}
                className="w-full border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue"
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) => set('isRecurring', e.target.checked)}
                className="w-4 h-4 accent-outlook-blue"
              />
              <span className="text-sm font-medium text-outlook-text">Recurring chore</span>
            </label>
          </div>

          {form.isRecurring && (
            <>
              <div>
                <label className="block text-sm font-medium text-outlook-text mb-2">
                  Repeat on <span className="text-red-500">*</span>
                </label>
                <RecurrenceSelector
                  selectedDays={form.recurrenceDays}
                  onChange={(days) => set('recurrenceDays', days)}
                />
                {errors.recurrenceDays && (
                  <p className="text-red-500 text-xs mt-1">{errors.recurrenceDays}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-outlook-text mb-1">End Date (optional)</label>
                <input
                  type="date"
                  value={form.recurrenceEndDate || ''}
                  onChange={(e) => set('recurrenceEndDate', e.target.value)}
                  className="w-full border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue"
                />
              </div>
            </>
          )}

          {/* Assignment */}
          <div>
            <label className="block text-sm font-medium text-outlook-text mb-1">Assign To</label>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 transition-colors"
                style={{ backgroundColor: form.color }}
              />
              <select
                value={form.assignedTo || ''}
                onChange={(e) => {
                  const id = e.target.value || null
                  const memberColor = id ? team.find((m) => m.id === id)?.color : undefined
                  setForm((f) => ({ ...f, assignedTo: id, color: memberColor ?? UNASSIGNED_COLOR }))
                }}
                className="flex-1 border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue"
              >
                <option value="">— Unassigned —</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto-rotate */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoRotate}
                onChange={(e) => set('autoRotate', e.target.checked)}
                className="w-4 h-4 accent-outlook-blue"
              />
              <span className="text-sm font-medium text-outlook-text">Auto-rotate assignment through team</span>
            </label>
            {form.autoRotate && (
              <p className="text-xs text-outlook-text-muted mt-1 ml-6">
                Each instance will be assigned to the next team member in round-robin order.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-outlook-border">
            {isEdit && chore ? (
              <button
                type="button"
                onClick={() => onDelete(chore.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-outlook-text-light border border-outlook-border rounded hover:bg-outlook-gray transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-outlook-blue text-white rounded hover:bg-outlook-blue-hover transition-colors"
              >
                {isEdit ? 'Save Changes' : 'Create Chore'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
