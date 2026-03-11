import React, { useState } from 'react'
import { Save, Mail, Shield, Info, Eye, EyeOff } from 'lucide-react'
import type { EmailConfig, TeamMember } from '../../types'

interface CurrentUser {
  id: string
  name: string
  role: string
  email: string
}

interface SettingsPanelProps {
  currentUser: CurrentUser | null
  emailConfig: EmailConfig
  onEmailConfigSave: (config: EmailConfig) => void
  team: TeamMember[]
  onSwitchUser: (memberId: string) => void
}

export default function SettingsPanel({ currentUser, emailConfig, onEmailConfigSave, team, onSwitchUser }: SettingsPanelProps) {
  const [config, setConfig] = useState<EmailConfig>(emailConfig || { serviceId: '', templateId: '', publicKey: '' })
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const isAdmin = currentUser?.role === 'admin'

  const handleSave = () => {
    onEmailConfigSave(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = (field: keyof EmailConfig, val: string) => setConfig((c) => ({ ...c, [field]: val }))

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-outlook-text">Settings</h1>
          <p className="text-sm text-outlook-text-muted mt-0.5">Configure app preferences and integrations</p>
        </div>

        {/* Current user / role switcher */}
        <div className="bg-white border border-outlook-border rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-outlook-border bg-outlook-gray/50">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-outlook-blue" />
              <h2 className="text-sm font-semibold text-outlook-text">User & Role</h2>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-outlook-text-muted">
              Switch your active user to test different permission levels. Admins can create/delete chores and manage the team. Members can only complete chores.
            </p>
            <div>
              <label className="block text-xs font-medium text-outlook-text mb-1">Active User</label>
              <select
                value={currentUser?.id || ''}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue"
              >
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            {currentUser && (
              <div className="text-xs text-outlook-text-muted">
                Currently acting as: <strong className="text-outlook-text">{currentUser.name}</strong>{' '}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  currentUser.role === 'admin' ? 'bg-outlook-blue-light text-outlook-blue' : 'bg-gray-100 text-gray-600'
                }`}>
                  {currentUser.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* EmailJS config */}
        <div className="bg-white border border-outlook-border rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-outlook-border bg-outlook-gray/50">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-outlook-blue" />
              <h2 className="text-sm font-semibold text-outlook-text">Email Notifications (EmailJS)</h2>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded p-3">
              <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                To enable email reminders, create a free account at{' '}
                <a href="https://emailjs.com" target="_blank" rel="noreferrer" className="underline font-medium">
                  emailjs.com
                </a>
                {' '}and enter your credentials below. Your template should include variables:
                {' '}<code className="bg-blue-100 px-1 rounded">{'{{to_name}}'}</code>,
                {' '}<code className="bg-blue-100 px-1 rounded">{'{{to_email}}'}</code>,
                {' '}<code className="bg-blue-100 px-1 rounded">{'{{chore_title}}'}</code>,
                {' '}<code className="bg-blue-100 px-1 rounded">{'{{due_date}}'}</code>,
                {' '}<code className="bg-blue-100 px-1 rounded">{'{{due_time}}'}</code>.
              </p>
            </div>

            {!isAdmin && (
              <p className="text-sm text-outlook-text-muted italic">Only admins can configure email settings.</p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-outlook-text mb-1">Service ID</label>
                <input
                  type="text"
                  value={config.serviceId}
                  onChange={(e) => set('serviceId', e.target.value)}
                  disabled={!isAdmin}
                  className="w-full border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="service_xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-outlook-text mb-1">Template ID</label>
                <input
                  type="text"
                  value={config.templateId}
                  onChange={(e) => set('templateId', e.target.value)}
                  disabled={!isAdmin}
                  className="w-full border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="template_xxxxxxx"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-outlook-text mb-1">Public Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={config.publicKey}
                    onChange={(e) => set('publicKey', e.target.value)}
                    disabled={!isAdmin}
                    className="w-full border border-outlook-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-outlook-blue disabled:bg-gray-50 disabled:text-gray-400 pr-10"
                    placeholder="Your EmailJS public key"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-outlook-text-muted hover:text-outlook-text"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-outlook-blue text-white text-sm font-medium rounded hover:bg-outlook-blue-hover transition-colors"
                >
                  <Save size={14} />
                  Save Configuration
                </button>
                {saved && (
                  <span className="text-sm text-green-600 font-medium">Saved!</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-white border border-outlook-border rounded-lg overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-outlook-border bg-outlook-gray/50">
            <h2 className="text-sm font-semibold text-outlook-text">About</h2>
          </div>
          <div className="px-5 py-4 text-sm text-outlook-text-light space-y-1">
            <p><strong className="text-outlook-text">Office Chores</strong> — v1.0.0</p>
            <p>A React + Vite chore management app with Outlook-style calendar.</p>
            <p className="text-xs text-outlook-text-muted">All data is stored in your browser's localStorage.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
