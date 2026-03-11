import React, { useState, useCallback } from 'react'
import { loadFromStorage, saveToStorage, KEYS, seedDemoData } from './utils/localStorage'
import { useChores } from './hooks/useChores'
import { useTeam } from './hooks/useTeam'
import type { EmailConfig, ViewType, CalendarView, Chore, ChoreInstance } from './types'

type ChoreFormData = Omit<Chore, 'id' | 'rotationIndex' | 'createdBy'> & {
  id?: string
  rotationIndex?: number
  createdBy?: string
}

import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import CalendarViewComponent from './components/Calendar/CalendarView'
import ChoreModal from './components/Chores/ChoreModal'
import ChoreCompleteModal from './components/Chores/ChoreCompleteModal'
import ChoreListPanel from './components/Chores/ChoreListPanel'
import TeamPanel from './components/Team/TeamPanel'
import SettingsPanel from './components/Settings/SettingsPanel'

// Seed demo data on first load
seedDemoData()

interface ChoreModalState {
  chore: Chore | null
}

interface CompleteModalState {
  instance: ChoreInstance
  chore: Chore | undefined
}

export default function App() {
  // State
  const [activeView, setActiveView] = useState<ViewType>('calendar')
  const [calView, setCalView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  // Modals
  const [choreModal, setChoreModal] = useState<ChoreModalState | null>(null)
  const [completeModal, setCompleteModal] = useState<CompleteModalState | null>(null)

  // Email config
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() =>
    loadFromStorage<EmailConfig>(KEYS.EMAIL_CONFIG, { serviceId: '', templateId: '', publicKey: '' })
  )

  // Hooks
  const { team, currentUser, addMember, updateMember, removeMember, switchUser } = useTeam()
  const { chores, choreInstances, addChore, updateChore, deleteChore, completeInstance, uncompleteInstance, reassignInstance } = useChores(team)

  // --- Chore modal handlers ---
  const openNewChore = () => setChoreModal({ chore: null })
  const openEditChore = (chore: Chore) => setChoreModal({ chore })
  const closeChoreModal = () => setChoreModal(null)

  const handleSaveChore = useCallback((formData: ChoreFormData) => {
    if (formData.id) {
      updateChore(formData.id, formData)
    } else {
      addChore(formData)
    }
    setChoreModal(null)
  }, [addChore, updateChore])

  const handleDeleteChore = useCallback((id: string) => {
    if (window.confirm('Delete this chore and all its instances?')) {
      deleteChore(id)
      setChoreModal(null)
    }
  }, [deleteChore])

  // --- Complete modal handlers ---
  const openInstanceModal = (instance: ChoreInstance) => {
    const chore = chores.find((c) => c.id === instance.choreId)
    setCompleteModal({ instance, chore })
  }
  const closeCompleteModal = () => setCompleteModal(null)

  // --- Email config ---
  const handleEmailConfigSave = (config: EmailConfig) => {
    setEmailConfig(config)
    saveToStorage(KEYS.EMAIL_CONFIG, config)
  }

  // --- Render main content area ---
  const renderMain = () => {
    switch (activeView) {
      case 'calendar':
        return (
          <CalendarViewComponent
            choreInstances={choreInstances}
            team={team}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            view={calView}
            onViewChange={setCalView}
            onEventClick={openInstanceModal}
            currentUser={currentUser}
          />
        )
      case 'chores':
        return (
          <ChoreListPanel
            chores={chores}
            choreInstances={choreInstances}
            team={team}
            currentUser={currentUser}
            onNewChore={openNewChore}
            onEditChore={openEditChore}
            onDeleteChore={handleDeleteChore}
            onInstanceClick={openInstanceModal}
          />
        )
      case 'team':
        return (
          <TeamPanel
            team={team}
            currentUser={currentUser}
            onAddMember={addMember}
            onUpdateMember={updateMember}
            onRemoveMember={removeMember}
          />
        )
      case 'settings':
        return (
          <SettingsPanel
            currentUser={currentUser}
            emailConfig={emailConfig}
            onEmailConfigSave={handleEmailConfigSave}
            team={team}
            onSwitchUser={switchUser}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex flex-col bg-outlook-gray font-sans overflow-hidden">
      {/* Top header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        view={calView}
        onViewChange={setCalView}
        onNewChore={openNewChore}
        currentUser={currentUser}
      />

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          currentDate={currentDate}
          onDateChange={(d) => { setCurrentDate(d); setActiveView('calendar') }}
          team={team}
          currentUser={currentUser}
          onSwitchUser={switchUser}
        />

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden">
          {renderMain()}
        </main>
      </div>

      {/* Chore add/edit modal */}
      {choreModal && (
        <ChoreModal
          chore={choreModal.chore}
          team={team}
          onSave={handleSaveChore}
          onDelete={handleDeleteChore}
          onClose={closeChoreModal}
        />
      )}

      {/* Chore complete/detail modal */}
      {completeModal && (
        <ChoreCompleteModal
          instance={completeModal.instance}
          chore={completeModal.chore}
          team={team}
          currentUser={currentUser}
          emailConfig={emailConfig}
          onComplete={completeInstance}
          onUncomplete={uncompleteInstance}
          onReassign={reassignInstance}
          onClose={closeCompleteModal}
          onEditChore={openEditChore}
        />
      )}
    </div>
  )
}
