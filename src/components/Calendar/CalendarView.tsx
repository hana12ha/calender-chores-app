import React, { useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { EventPropGetter } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import ChoreEvent from './ChoreEvent'
import type { ChoreInstance, TeamMember, CalendarView as CalendarViewType } from '../../types'

const locales = { 'en-US': enUS }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

const VIEW_MAP: Record<string, string> = {
  month: 'month',
  week: 'week',
  day: 'day',
  agenda: 'agenda',
}

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface CalendarViewProps {
  choreInstances: ChoreInstance[]
  team: TeamMember[]
  currentDate: Date
  onDateChange: (date: Date) => void
  view: CalendarViewType
  onViewChange: (view: CalendarViewType) => void
  onEventClick: (instance: ChoreInstance) => void
  currentUser: CurrentUser | null
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: ChoreInstance & {
    color: string
    assigneeName: string | null
    canComplete: boolean
  }
}

export default function CalendarView({
  choreInstances,
  team,
  currentDate,
  onDateChange,
  view,
  onViewChange,
  onEventClick,
  currentUser,
}: CalendarViewProps) {
  const getMember = (id: string | null) => id ? team.find((m) => m.id === id) : undefined

  const events = useMemo<CalendarEvent[]>(() => {
    return choreInstances.map((instance) => {
      const member = getMember(instance.assignedTo)
      const color = member?.color || instance.color || '#0078d4'
      const [year, month, day] = instance.date.split('-').map(Number)
      const [hours, minutes] = (instance.time || '09:00').split(':').map(Number)

      const start = new Date(year, month - 1, day, hours, minutes)
      const end = new Date(year, month - 1, day, hours + 1, minutes)

      return {
        id: instance.id,
        title: instance.title,
        start,
        end,
        resource: {
          ...instance,
          color,
          assigneeName: member?.name || null,
          canComplete:
            currentUser?.role === 'admin' ||
            !instance.assignedTo ||
            instance.assignedTo === currentUser?.id,
        },
      }
    })
  }, [choreInstances, team, currentUser])

  const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
    const color = event.resource?.color || '#0078d4'
    const completed = event.resource?.completed
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        opacity: completed ? 0.6 : 1,
        borderRadius: '3px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
      },
    }
  }

  const components = {
    event: ChoreEvent,
  }

  return (
    <div className="flex-1 overflow-hidden p-2">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={(VIEW_MAP[view] || 'month') as CalendarViewType}
        date={currentDate}
        onNavigate={onDateChange}
        onView={(v) => onViewChange(v as CalendarViewType)}
        onSelectEvent={(event) => onEventClick((event as CalendarEvent).resource)}
        eventPropGetter={eventStyleGetter}
        components={components}
        popup
        showMultiDayTimes
      />
    </div>
  )
}
