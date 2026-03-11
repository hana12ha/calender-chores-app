import React from 'react'

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
]

interface RecurrenceSelectorProps {
  selectedDays: number[]
  onChange: (days: number[]) => void
}

export default function RecurrenceSelector({ selectedDays, onChange }: RecurrenceSelectorProps) {
  const toggle = (val: number) => {
    if (selectedDays.includes(val)) {
      onChange(selectedDays.filter((d) => d !== val))
    } else {
      onChange([...selectedDays, val].sort((a, b) => a - b))
    }
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {DAYS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          onClick={() => toggle(value)}
          className={`w-10 h-10 rounded-full text-xs font-semibold transition-colors border
            ${selectedDays.includes(value)
              ? 'bg-outlook-blue text-white border-outlook-blue'
              : 'bg-white text-outlook-text-light border-outlook-border hover:bg-outlook-gray'
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
