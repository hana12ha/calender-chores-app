import React, { useState } from 'react'
import { format, parseISO, isToday, isPast } from 'date-fns'
import { CheckCircle, Clock, Repeat, User, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import type { Chore, ChoreInstance, TeamMember } from '../../types'

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface ChoreListPanelProps {
  chores: Chore[]
  choreInstances: ChoreInstance[]
  team: TeamMember[]
  currentUser: CurrentUser | null
  onNewChore: () => void
  onEditChore: (chore: Chore) => void
  onDeleteChore: (id: string) => void
  onInstanceClick: (instance: ChoreInstance) => void
}

type FilterType = 'all' | 'pending' | 'completed' | 'overdue'

export default function ChoreListPanel({
  chores,
  choreInstances,
  team,
  currentUser,
  onNewChore,
  onEditChore,
  onDeleteChore,
  onInstanceClick,
}: ChoreListPanelProps) {
  const isAdmin = currentUser?.role === 'admin'
  const [filter, setFilter] = useState<FilterType>('all')

  const getMember = (id: string | null) => id ? team.find((m) => m.id === id) : undefined

  const filtered = choreInstances.filter((inst) => {
    if (filter === 'pending') return !inst.completed
    if (filter === 'completed') return inst.completed
    if (filter === 'overdue') {
      try {
        return !inst.completed && isPast(parseISO(inst.date + 'T' + inst.time))
      } catch { return false }
    }
    return true
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  const filterTabs: [FilterType, string][] = [
    ['all', 'All'],
    ['pending', 'Pending'],
    ['overdue', 'Overdue'],
    ['completed', 'Completed'],
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-outlook-text">Chores</h1>
            <p className="text-sm text-outlook-text-muted mt-0.5">
              {choreInstances.filter(i => !i.completed).length} pending
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={onNewChore}
              className="flex items-center gap-1.5 px-3 py-2 bg-outlook-blue text-white text-sm font-medium rounded hover:bg-outlook-blue-hover transition-colors"
            >
              <Plus size={15} />
              New Chore
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 border-b border-outlook-border">
          {filterTabs.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
                ${filter === val
                  ? 'border-outlook-blue text-outlook-blue'
                  : 'border-transparent text-outlook-text-light hover:text-outlook-text'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chore instances list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-outlook-text-muted">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No chores found.</p>
            {isAdmin && filter === 'all' && (
              <button
                onClick={onNewChore}
                className="mt-3 text-sm text-outlook-blue hover:underline"
              >
                Create your first chore
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((inst) => {
              const member = getMember(inst.assignedTo)
              const chore = chores.find((c) => c.id === inst.choreId)
              let overdue = false
              try {
                overdue = !inst.completed && isPast(parseISO(inst.date + 'T' + inst.time))
              } catch { /* ignore */ }

              return (
                <div
                  key={inst.id}
                  onClick={() => onInstanceClick(inst)}
                  className="flex items-center gap-3 bg-white border border-outlook-border rounded-lg px-4 py-3 hover:border-outlook-blue hover:shadow-sm cursor-pointer transition-all group"
                >
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: member?.color || inst.color || '#0078d4' }}
                  />

                  {/* Status icon */}
                  {inst.completed ? (
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  ) : overdue ? (
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  ) : (
                    <Clock size={16} className="text-outlook-text-muted flex-shrink-0" />
                  )}

                  {/* Title + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium truncate ${
                        inst.completed ? 'line-through text-outlook-text-muted' : 'text-outlook-text'
                      }`}>
                        {inst.title}
                      </span>
                      {chore?.isRecurring && (
                        <Repeat size={11} className="text-outlook-text-muted flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-xs ${overdue && !inst.completed ? 'text-red-500 font-medium' : 'text-outlook-text-muted'}`}>
                        {(() => {
                          try {
                            const d = parseISO(inst.date)
                            return isToday(d) ? `Today, ${inst.time}` : `${format(d, 'MMM d')}, ${inst.time}`
                          } catch { return inst.date }
                        })()}
                      </span>
                      {member && (
                        <span className="flex items-center gap-1 text-xs text-outlook-text-muted">
                          <User size={10} />
                          {member.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin actions */}
                  {isAdmin && chore && (
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditChore(chore) }}
                        className="p-1.5 text-outlook-text-muted hover:text-outlook-blue hover:bg-outlook-blue-light rounded transition-colors"
                        title="Edit chore"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChore(chore.id) }}
                        className="p-1.5 text-outlook-text-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete chore"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
