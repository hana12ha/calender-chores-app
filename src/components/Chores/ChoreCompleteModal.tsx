import React, { useState } from 'react'
import { X, CheckCircle, RotateCcw, UserCheck, Mail, AlertCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { sendReminderEmail } from '../../utils/emailjs'
import type { ChoreInstance, Chore, TeamMember, EmailConfig } from '../../types'

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface ChoreCompleteModalProps {
  instance: ChoreInstance
  chore: Chore | undefined
  team: TeamMember[]
  currentUser: CurrentUser | null
  emailConfig: EmailConfig
  onComplete: (instanceId: string, note?: string) => void
  onUncomplete: (instanceId: string) => void
  onReassign: (instanceId: string, memberId: string) => void
  onClose: () => void
  onEditChore: (chore: Chore) => void
}

type EmailStatus = null | 'sending' | 'sent' | 'error'

export default function ChoreCompleteModal({
  instance,
  chore,
  team,
  currentUser,
  emailConfig,
  onComplete,
  onUncomplete,
  onReassign,
  onClose,
  onEditChore,
}: ChoreCompleteModalProps) {
  const [note, setNote] = useState(instance?.completedNote || '')
  const [reassignTo, setReassignTo] = useState(instance?.assignedTo || '')
  const [showReassign, setShowReassign] = useState(false)
  const [emailStatus, setEmailStatus] = useState<EmailStatus>(null)
  const [emailError, setEmailError] = useState('')

  if (!instance) return null

  const isAdmin = currentUser?.role === 'admin'
  const assignee = team.find((m) => m.id === instance.assignedTo)
  const canComplete =
    isAdmin ||
    !instance.assignedTo ||
    instance.assignedTo === currentUser?.id

  const formattedDate = (() => {
    try { return format(parseISO(instance.date), 'EEEE, MMMM d, yyyy') }
    catch { return instance.date }
  })()

  const handleComplete = () => {
    onComplete(instance.id, note)
    onClose()
  }

  const handleUncomplete = () => {
    onUncomplete(instance.id)
    onClose()
  }

  const handleReassign = () => {
    if (reassignTo) {
      onReassign(instance.id, reassignTo)
      setShowReassign(false)
    }
  }

  const handleSendReminder = async () => {
    if (!assignee) return
    setEmailStatus('sending')
    setEmailError('')
    try {
      await sendReminderEmail({
        emailConfig,
        toName: assignee.name,
        toEmail: assignee.email,
        choreTitle: instance.title,
        dueDate: formattedDate,
        dueTime: instance.time,
        note: instance.description || '',
      })
      setEmailStatus('sent')
    } catch (err) {
      setEmailStatus('error')
      setEmailError((err as Error).message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 rounded-t-lg text-white"
          style={{ backgroundColor: assignee?.color || instance.color || '#0078d4' }}
        >
          <div>
            <h2 className="text-lg font-semibold">{instance.title}</h2>
            <p className="text-sm opacity-90">{formattedDate} at {instance.time}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Status badge */}
          {instance.completed && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
              <CheckCircle size={16} className="text-green-600" />
              <div>
                <span className="text-sm font-medium text-green-700">Completed</span>
                {instance.completedAt && (
                  <span className="text-xs text-green-600 ml-2">
                    {format(new Date(instance.completedAt), 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Assignee */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-outlook-text-muted block">Assigned to</span>
              <span className="text-sm font-medium text-outlook-text">
                {assignee ? assignee.name : 'Unassigned'}
              </span>
            </div>
            {isAdmin && !instance.completed && (
              <button
                onClick={() => setShowReassign(!showReassign)}
                className="flex items-center gap-1 text-xs text-outlook-blue hover:underline"
              >
                <UserCheck size={12} />
                Reassign
              </button>
            )}
          </div>

          {/* Reassign panel */}
          {showReassign && (
            <div className="bg-outlook-gray rounded p-3 space-y-2">
              <select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="w-full border border-outlook-border rounded px-2 py-1.5 text-sm"
              >
                <option value="">— Unassigned —</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleReassign}
                  className="px-3 py-1 text-xs bg-outlook-blue text-white rounded hover:bg-outlook-blue-hover"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowReassign(false)}
                  className="px-3 py-1 text-xs border border-outlook-border rounded hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          {instance.description && (
            <div>
              <span className="text-xs text-outlook-text-muted block mb-1">Description</span>
              <p className="text-sm text-outlook-text">{instance.description}</p>
            </div>
          )}

          {/* Completion note */}
          {!instance.completed && canComplete && (
            <div>
              <label className="block text-sm font-medium text-outlook-text mb-1">
                Completion note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue resize-none"
                placeholder="Any notes about completing this chore..."
              />
            </div>
          )}

          {instance.completed && instance.completedNote && (
            <div>
              <span className="text-xs text-outlook-text-muted block mb-1">Completion note</span>
              <p className="text-sm text-outlook-text italic">"{instance.completedNote}"</p>
            </div>
          )}

          {/* Email reminder */}
          {isAdmin && assignee?.email && (
            <div className="border-t border-outlook-border pt-3">
              <button
                onClick={handleSendReminder}
                disabled={emailStatus === 'sending'}
                className="flex items-center gap-1.5 text-sm text-outlook-blue hover:underline disabled:opacity-50"
              >
                <Mail size={14} />
                {emailStatus === 'sending' ? 'Sending...' : 'Send email reminder'}
              </button>
              {emailStatus === 'sent' && (
                <p className="text-xs text-green-600 mt-1">Reminder sent to {assignee.email}</p>
              )}
              {emailStatus === 'error' && (
                <div className="flex items-start gap-1 mt-1">
                  <AlertCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">{emailError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-outlook-border bg-outlook-gray rounded-b-lg">
          <div className="flex gap-2">
            {isAdmin && onEditChore && chore && (
              <button
                onClick={() => { onEditChore(chore); onClose() }}
                className="px-3 py-2 text-sm text-outlook-text-light border border-outlook-border bg-white rounded hover:bg-outlook-gray transition-colors"
              >
                Edit Chore
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-outlook-text-light border border-outlook-border bg-white rounded hover:bg-outlook-gray transition-colors"
            >
              Close
            </button>
            {instance.completed ? (
              isAdmin && (
                <button
                  onClick={handleUncomplete}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={14} />
                  Mark Incomplete
                </button>
              )
            ) : (
              canComplete && (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={14} />
                  Mark Complete
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
