import React, { useState } from 'react'
import {
  Calendar, CheckSquare, Users, Settings, ChevronDown, ChevronUp
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, isToday } from 'date-fns'
import type { ViewType, TeamMember } from '../../types'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  key: ViewType
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'chores', label: 'Chores', icon: CheckSquare },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
]

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface MiniCalendarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

function MiniCalendar({ currentDate, onDateChange }: MiniCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(new Date())

  const monthStart = startOfMonth(displayMonth)
  const monthEnd = endOfMonth(monthStart)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setDisplayMonth(d => addDays(startOfMonth(d), -1))}
          className="p-0.5 rounded hover:bg-outlook-gray text-outlook-text-light"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="text-xs font-semibold text-outlook-text">{format(displayMonth, 'MMM yyyy')}</span>
        <button
          onClick={() => setDisplayMonth(d => addDays(endOfMonth(d), 1))}
          className="p-0.5 rounded hover:bg-outlook-gray text-outlook-text-light"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-outlook-text-muted py-0.5">{d}</div>
        ))}
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => onDateChange(d)}
            className={`text-center text-[11px] py-0.5 rounded transition-colors
              ${!isSameMonth(d, displayMonth) ? 'text-outlook-text-muted' : 'text-outlook-text'}
              ${isSameDay(d, currentDate) ? 'bg-outlook-blue text-white' : ''}
              ${isToday(d) && !isSameDay(d, currentDate) ? 'font-bold text-outlook-blue' : ''}
              ${isSameMonth(d, displayMonth) && !isSameDay(d, currentDate) ? 'hover:bg-outlook-gray' : ''}
            `}
          >
            {format(d, 'd')}
          </button>
        ))}
      </div>
    </div>
  )
}

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  currentDate: Date
  onDateChange: (date: Date) => void
  team: TeamMember[]
  currentUser: CurrentUser | null
  onSwitchUser: (memberId: string) => void
}

export default function Sidebar({ activeView, onViewChange, currentDate, onDateChange, team, currentUser, onSwitchUser }: SidebarProps) {
  const [teamExpanded, setTeamExpanded] = useState(true)

  return (
    <aside className="w-56 bg-white border-r border-outlook-border flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Navigation */}
      <nav className="py-2">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors
              ${activeView === key
                ? 'bg-outlook-blue-light text-outlook-blue border-r-2 border-outlook-blue'
                : 'text-outlook-text-light hover:bg-outlook-gray'
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <hr className="border-outlook-border" />

      {/* Mini calendar */}
      <MiniCalendar currentDate={currentDate} onDateChange={(d) => { onDateChange(d); onViewChange('calendar') }} />

      <hr className="border-outlook-border" />

      {/* Team list */}
      <div className="flex-1">
        <button
          onClick={() => setTeamExpanded(e => !e)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-outlook-text-light uppercase tracking-wide hover:bg-outlook-gray"
        >
          <span>My Team</span>
          {teamExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {teamExpanded && (
          <div className="pb-2">
            {team.map((member) => (
              <button
                key={member.id}
                onClick={() => onSwitchUser(member.id)}
                className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm transition-colors
                  ${currentUser?.id === member.id ? 'bg-outlook-blue-light' : 'hover:bg-outlook-gray'}`}
                title={`Switch to ${member.name}`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: member.color || '#a19f9d' }}
                />
                <span className="truncate text-outlook-text text-xs">{member.name}</span>
                {member.role === 'admin' && (
                  <span className="ml-auto text-[10px] text-outlook-blue font-medium">Admin</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current user indicator */}
      {currentUser && (
        <div className="border-t border-outlook-border px-4 py-2">
          <div className="text-[10px] text-outlook-text-muted uppercase tracking-wide mb-1">Logged in as</div>
          <div className="text-xs font-medium text-outlook-text truncate">{currentUser.name}</div>
          <div className="text-[10px] text-outlook-blue capitalize">{currentUser.role}</div>
        </div>
      )}
    </aside>
  )
}
