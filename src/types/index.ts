export interface Category {
  id: string
  name: string
}

export interface Chore {
  id: string
  title: string
  description: string
  dueDate: string
  dueTime: string
  isRecurring: boolean
  recurrenceDays: number[]
  recurrenceEndDate: string
  assignedTo: string | null
  autoRotate: boolean
  rotationIndex: number
  color: string
  createdBy: string
  categoryId: string | null
}

export interface ChoreInstance {
  id: string
  choreId: string
  title: string
  assignedTo: string | null
  date: string
  time: string
  completed: boolean
  completedAt: string | null
  completedNote: string
  color: string
  description?: string
  categoryId: string | null
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'regular' | 'member'
  color?: string
}

export interface EmailConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

export type ViewType = 'calendar' | 'chores' | 'team' | 'settings'
export type CalendarView = 'month' | 'week' | 'day' | 'agenda'
