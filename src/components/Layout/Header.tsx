import React from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'
import type { CalendarView } from '../../types'

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
}

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface HeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onNewChore: () => void
  currentUser: CurrentUser | null
}

export default function Header({ currentDate, onDateChange, view, onViewChange, onNewChore, currentUser }: HeaderProps) {
  const isAdmin = currentUser?.role === 'admin'

  const goBack = () => {
    if (view === 'month') onDateChange(subMonths(currentDate, 1))
    else if (view === 'week') onDateChange(subWeeks(currentDate, 1))
    else if (view === 'day') onDateChange(subDays(currentDate, 1))
    else onDateChange(subWeeks(currentDate, 1))
  }

  const goForward = () => {
    if (view === 'month') onDateChange(addMonths(currentDate, 1))
    else if (view === 'week') onDateChange(addWeeks(currentDate, 1))
    else if (view === 'day') onDateChange(addDays(currentDate, 1))
    else onDateChange(addWeeks(currentDate, 1))
  }

  const getTitle = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy')
    if (view === 'week') return format(currentDate, "'Week of' MMM d, yyyy")
    if (view === 'day') return format(currentDate, 'EEEE, MMMM d, yyyy')
    return format(currentDate, 'MMMM yyyy')
  }

  return (
    <header className="h-14 bg-white border-b border-outlook-border flex items-center px-4 gap-4 flex-shrink-0 z-10">
      {/* Title / branding */}
      <div className="flex items-center gap-2 mr-4">
        <Calendar size={20} className="text-outlook-blue" />
        <span className="font-semibold text-outlook-text text-lg hidden sm:block">Office Chores</span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onDateChange(new Date())}
          className="px-3 py-1.5 text-sm font-medium text-outlook-blue border border-outlook-blue rounded hover:bg-outlook-blue-light transition-colors"
        >
          Today
        </button>
        <button
          onClick={goBack}
          className="p-1.5 rounded hover:bg-outlook-gray transition-colors text-outlook-text-light"
          title="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={goForward}
          className="p-1.5 rounded hover:bg-outlook-gray transition-colors text-outlook-text-light"
          title="Next"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Current date title */}
      <h1 className="text-base font-semibold text-outlook-text flex-1">
        {getTitle()}
      </h1>

      {/* View switcher */}
      <div className="flex border border-outlook-border rounded overflow-hidden">
        {(Object.entries(VIEW_LABELS) as [CalendarView, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              view === key
                ? 'bg-outlook-blue text-white'
                : 'bg-white text-outlook-text-light hover:bg-outlook-gray'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* New Chore button (admin only) */}
      {isAdmin && (
        <button
          onClick={onNewChore}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-outlook-blue text-white text-sm font-medium rounded hover:bg-outlook-blue-hover transition-colors"
        >
          <Plus size={16} />
          New Chore
        </button>
      )}
    </header>
  )
}
