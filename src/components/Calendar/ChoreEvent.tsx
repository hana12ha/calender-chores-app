import React from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import type { ChoreInstance } from '../../types'

interface ChoreEventResource extends ChoreInstance {
  assigneeName: string | null
  canComplete: boolean
}

interface ChoreEventProps {
  event: {
    title: string
    resource?: ChoreEventResource
  }
}

export default function ChoreEvent({ event }: ChoreEventProps) {
  const { resource } = event
  if (!resource) return <div className="text-xs truncate px-1">{event.title}</div>

  const { completed, assigneeName, color } = resource

  return (
    <div
      className={`flex items-center gap-1 px-1 py-0.5 rounded text-white text-xs w-full overflow-hidden ${completed ? 'opacity-60' : ''}`}
      style={{ backgroundColor: color || '#0078d4' }}
      title={`${event.title}${assigneeName ? ` — ${assigneeName}` : ''}${completed ? ' (Done)' : ''}`}
    >
      {completed ? (
        <CheckCircle size={10} className="flex-shrink-0" />
      ) : (
        <Clock size={10} className="flex-shrink-0" />
      )}
      <span className="truncate font-medium">{event.title}</span>
      {assigneeName && (
        <span className="ml-auto opacity-80 truncate hidden sm:inline">{assigneeName}</span>
      )}
    </div>
  )
}
