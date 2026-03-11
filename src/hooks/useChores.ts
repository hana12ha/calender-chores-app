import { useState, useCallback } from 'react'
import { loadFromStorage, saveToStorage, KEYS } from '../utils/localStorage'
import { expandRecurringChore, createSingleInstance, reExpandChore } from '../utils/recurrence'
import type { Chore, ChoreInstance, TeamMember } from '../types'

type ChoreInput = Omit<Chore, 'id' | 'rotationIndex' | 'createdBy'> & {
  id?: string
  rotationIndex?: number
  createdBy?: string
}

interface UseChoresReturn {
  chores: Chore[]
  choreInstances: ChoreInstance[]
  addChore: (choreData: ChoreInput) => Chore
  updateChore: (id: string, updates: Partial<Chore>) => void
  deleteChore: (id: string) => void
  completeInstance: (instanceId: string, note?: string) => void
  uncompleteInstance: (instanceId: string) => void
  reassignInstance: (instanceId: string, memberId: string) => void
  updateInstance: (instanceId: string, updates: Partial<ChoreInstance>) => void
}

export const useChores = (team: TeamMember[]): UseChoresReturn => {
  const [chores, setChores] = useState<Chore[]>(() => loadFromStorage<Chore[]>(KEYS.CHORES, []))
  const [choreInstances, setChoreInstances] = useState<ChoreInstance[]>(() =>
    loadFromStorage<ChoreInstance[]>(KEYS.CHORE_INSTANCES, [])
  )

  const persistChores = useCallback((updated: Chore[]) => {
    setChores(updated)
    saveToStorage(KEYS.CHORES, updated)
  }, [])

  const persistInstances = useCallback((updated: ChoreInstance[]) => {
    setChoreInstances(updated)
    saveToStorage(KEYS.CHORE_INSTANCES, updated)
  }, [])

  // Add a new chore and generate its instances
  const addChore = useCallback((choreData: ChoreInput): Chore => {
    const chore: Chore = {
      ...choreData,
      id: crypto.randomUUID(),
      rotationIndex: 0,
      createdBy: choreData.createdBy ?? '',
    }
    const updatedChores = [...chores, chore]
    persistChores(updatedChores)

    const newInstances = chore.isRecurring
      ? expandRecurringChore(chore, team)
      : createSingleInstance(chore, team)

    const updatedInstances = [...choreInstances, ...newInstances]
    persistInstances(updatedInstances)

    return chore
  }, [chores, choreInstances, team, persistChores, persistInstances])

  // Update an existing chore and re-expand its instances
  const updateChore = useCallback((id: string, updates: Partial<Chore>): void => {
    const updatedChores = chores.map((c) => (c.id === id ? { ...c, ...updates } : c))
    persistChores(updatedChores)

    const updatedChore = updatedChores.find((c) => c.id === id)
    if (!updatedChore) return

    // Remove old non-completed instances for this chore, then re-expand
    const otherInstances = choreInstances.filter((i) => i.choreId !== id)
    const reExpanded = reExpandChore(updatedChore, choreInstances, team)
    persistInstances([...otherInstances, ...reExpanded])
  }, [chores, choreInstances, team, persistChores, persistInstances])

  // Delete a chore and all its instances
  const deleteChore = useCallback((id: string): void => {
    persistChores(chores.filter((c) => c.id !== id))
    persistInstances(choreInstances.filter((i) => i.choreId !== id))
  }, [chores, choreInstances, persistChores, persistInstances])

  // Mark an instance as complete
  const completeInstance = useCallback((instanceId: string, note = ''): void => {
    const updated = choreInstances.map((i) =>
      i.id === instanceId
        ? { ...i, completed: true, completedAt: new Date().toISOString(), completedNote: note }
        : i
    )
    persistInstances(updated)
  }, [choreInstances, persistInstances])

  // Uncomplete an instance
  const uncompleteInstance = useCallback((instanceId: string): void => {
    const updated = choreInstances.map((i) =>
      i.id === instanceId
        ? { ...i, completed: false, completedAt: null, completedNote: '' }
        : i
    )
    persistInstances(updated)
  }, [choreInstances, persistInstances])

  // Reassign an instance
  const reassignInstance = useCallback((instanceId: string, memberId: string): void => {
    const updated = choreInstances.map((i) =>
      i.id === instanceId ? { ...i, assignedTo: memberId } : i
    )
    persistInstances(updated)
  }, [choreInstances, persistInstances])

  // Update instance (sync from chore)
  const updateInstance = useCallback((instanceId: string, updates: Partial<ChoreInstance>): void => {
    const updated = choreInstances.map((i) =>
      i.id === instanceId ? { ...i, ...updates } : i
    )
    persistInstances(updated)
  }, [choreInstances, persistInstances])

  return {
    chores,
    choreInstances,
    addChore,
    updateChore,
    deleteChore,
    completeInstance,
    uncompleteInstance,
    reassignInstance,
    updateInstance,
  }
}
