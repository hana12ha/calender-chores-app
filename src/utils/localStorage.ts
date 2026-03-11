// localStorage helpers

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch (err) {
    console.error(`Error loading "${key}" from localStorage:`, err)
    return fallback
  }
}

export const saveToStorage = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Error saving "${key}" to localStorage:`, err)
  }
}

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error(`Error removing "${key}" from localStorage:`, err)
  }
}

// Storage keys
export const KEYS = {
  CHORES: 'chores',
  CHORE_INSTANCES: 'choreInstances',
  TEAM: 'team',
  CURRENT_USER: 'currentUser',
  EMAIL_CONFIG: 'emailConfig',
} as const

// Seed demo data if storage is empty
export const seedDemoData = (): void => {
  const existingTeam = loadFromStorage<unknown[]>(KEYS.TEAM, [])
  if (existingTeam && existingTeam.length > 0) return // already seeded

  const adminId = crypto.randomUUID()
  const member1Id = crypto.randomUUID()
  const member2Id = crypto.randomUUID()

  const team = [
    { id: adminId, name: 'Admin User', email: 'admin@company.com', role: 'admin', color: '#0078d4' },
    { id: member1Id, name: 'Alice Johnson', email: 'alice@company.com', role: 'member', color: '#107c10' },
    { id: member2Id, name: 'Bob Smith', email: 'bob@company.com', role: 'member', color: '#d83b01' },
  ]

  const currentUser = { id: adminId, name: 'Admin User', role: 'admin', email: 'admin@company.com' }

  saveToStorage(KEYS.TEAM, team)
  saveToStorage(KEYS.CURRENT_USER, currentUser)
  saveToStorage(KEYS.CHORES, [])
  saveToStorage(KEYS.CHORE_INSTANCES, [])
  saveToStorage(KEYS.EMAIL_CONFIG, { serviceId: '', templateId: '', publicKey: '' })
}
