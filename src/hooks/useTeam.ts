import { useState, useCallback } from 'react'
import { loadFromStorage, saveToStorage, KEYS } from '../utils/localStorage'
import type { TeamMember } from '../types'

const MEMBER_COLORS = [
  '#0078d4', '#107c10', '#d83b01', '#8764b8', '#038387',
  '#ca5010', '#004b50', '#7a7574', '#e3008c', '#00b7c3',
]

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface UseTeamReturn {
  team: TeamMember[]
  currentUser: CurrentUser | null
  addMember: (memberData: Omit<TeamMember, 'id' | 'color'>) => TeamMember
  updateMember: (id: string, updates: Partial<TeamMember>) => void
  removeMember: (id: string) => void
  switchUser: (memberId: string) => void
  getMemberById: (id: string) => TeamMember | undefined
  getMemberColor: (id: string) => string
}

export const useTeam = (): UseTeamReturn => {
  const [team, setTeam] = useState<TeamMember[]>(() => loadFromStorage<TeamMember[]>(KEYS.TEAM, []))
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() =>
    loadFromStorage<CurrentUser | null>(KEYS.CURRENT_USER, null)
  )

  const persistTeam = useCallback((updated: TeamMember[]) => {
    setTeam(updated)
    saveToStorage(KEYS.TEAM, updated)
  }, [])

  const addMember = useCallback((memberData: Omit<TeamMember, 'id' | 'color'>): TeamMember => {
    const usedColors = team.map((m) => m.color)
    const color = MEMBER_COLORS.find((c) => !usedColors.includes(c)) || MEMBER_COLORS[team.length % MEMBER_COLORS.length]
    const member: TeamMember = {
      id: crypto.randomUUID(),
      color,
      role: memberData.role ?? 'member',
      name: memberData.name,
      email: memberData.email,
    }
    persistTeam([...team, member])
    return member
  }, [team, persistTeam])

  const updateMember = useCallback((id: string, updates: Partial<TeamMember>): void => {
    const updated = team.map((m) => (m.id === id ? { ...m, ...updates } : m))
    persistTeam(updated)

    // If updating current user, sync
    if (currentUser?.id === id) {
      const updatedUser = { ...currentUser, ...updates }
      setCurrentUser(updatedUser)
      saveToStorage(KEYS.CURRENT_USER, updatedUser)
    }
  }, [team, currentUser, persistTeam])

  const removeMember = useCallback((id: string): void => {
    persistTeam(team.filter((m) => m.id !== id))
  }, [team, persistTeam])

  const switchUser = useCallback((memberId: string): void => {
    const member = team.find((m) => m.id === memberId)
    if (member) {
      const user: CurrentUser = { id: member.id, name: member.name, role: member.role, email: member.email }
      setCurrentUser(user)
      saveToStorage(KEYS.CURRENT_USER, user)
    }
  }, [team])

  const getMemberById = useCallback((id: string): TeamMember | undefined => team.find((m) => m.id === id), [team])

  const getMemberColor = useCallback((id: string): string => {
    const m = team.find((t) => t.id === id)
    return m?.color || '#a19f9d'
  }, [team])

  return {
    team,
    currentUser,
    addMember,
    updateMember,
    removeMember,
    switchUser,
    getMemberById,
    getMemberColor,
  }
}
