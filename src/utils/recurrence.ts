import { addDays, parseISO, format, isAfter, isBefore, getDay } from 'date-fns'
import type { Chore, ChoreInstance, TeamMember } from '../types'

/**
 * Expand a recurring chore into instances for the next 90 days
 * (or until recurrenceEndDate, whichever is sooner).
 * Returns an array of choreInstance objects.
 */
export const expandRecurringChore = (chore: Chore, team: TeamMember[] = []): ChoreInstance[] => {
  if (!chore.isRecurring || !chore.recurrenceDays || chore.recurrenceDays.length === 0) {
    // Non-recurring: single instance
    return [createInstance(chore, chore.dueDate, chore.assignedTo)]
  }

  const startDate = parseISO(chore.dueDate)
  const windowEnd = addDays(new Date(), 90)
  const endDate = chore.recurrenceEndDate
    ? (isBefore(parseISO(chore.recurrenceEndDate), windowEnd)
        ? parseISO(chore.recurrenceEndDate)
        : windowEnd)
    : windowEnd

  const instances: ChoreInstance[] = []
  let rotationIdx = chore.rotationIndex || 0
  let current = startDate

  while (!isAfter(current, endDate)) {
    const dayOfWeek = getDay(current) // 0=Sun ... 6=Sat
    if (chore.recurrenceDays.includes(dayOfWeek)) {
      let assignedTo: string | null = chore.assignedTo

      if (chore.autoRotate && team.length > 0) {
        assignedTo = team[rotationIdx % team.length].id
        rotationIdx++
      }

      instances.push(createInstance(chore, format(current, 'yyyy-MM-dd'), assignedTo))
    }
    current = addDays(current, 1)
  }

  return instances
}

/**
 * Generate instances for a non-recurring chore (single instance).
 */
export const createSingleInstance = (chore: Chore): ChoreInstance[] => {
  return [createInstance(chore, chore.dueDate, chore.assignedTo)]
}

const createInstance = (chore: Chore, date: string, assignedTo: string | null): ChoreInstance => ({
  id: crypto.randomUUID(),
  choreId: chore.id,
  title: chore.title,
  assignedTo: assignedTo || null,
  date,
  time: chore.dueTime || '09:00',
  completed: false,
  completedAt: null,
  completedNote: '',
  color: chore.color || '#0078d4',
  description: chore.description || '',
})

/**
 * Re-expand instances for a chore, preserving completion state of existing instances.
 */
export const reExpandChore = (
  chore: Chore,
  existingInstances: ChoreInstance[],
  team: TeamMember[] = []
): ChoreInstance[] => {
  const completedMap: Record<string, ChoreInstance> = {}
  existingInstances
    .filter((i) => i.choreId === chore.id && i.completed)
    .forEach((i) => {
      completedMap[i.date] = i
    })

  const newInstances = chore.isRecurring
    ? expandRecurringChore(chore, team)
    : createSingleInstance(chore)

  return newInstances.map((inst) => {
    if (completedMap[inst.date]) {
      return { ...inst, ...completedMap[inst.date], id: completedMap[inst.date].id }
    }
    return inst
  })
}
