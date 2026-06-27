'use client'

import {
  EQUIPMENT_OPTIONS,
  WEEKDAYS,
  WEEKLY_FREQUENCIES,
} from '../maintenance.constants'
import type { MaintenancePriority, OrgUser } from '../maintenance.types'

export const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '12px 13px', border: '1px solid var(--app-border-strong)',
  borderRadius: '11px', background: 'var(--app-surface-2)', color: 'var(--app-text)',
  fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

export const LABEL_STYLE: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--app-text)', marginBottom: '7px',
}

export function RequiredMark() {
  return <span style={{ color: '#dc2626' }}>*</span>
}

export function FieldError({ message }: { message: string }) {
  return <div style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '6px' }}>{message}</div>
}

const SELECT_WRAP: React.CSSProperties = { position: 'relative' }
const CHEVRON = (
  <span style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--app-text-soft)' }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
  </span>
)

export function EquipmentSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div style={SELECT_WRAP}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '36px', cursor: 'pointer', color: value ? 'var(--app-text)' : 'var(--app-text-faint)' }}
      >
        <option value="">Select equipment…</option>
        {EQUIPMENT_OPTIONS.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {CHEVRON}
    </div>
  )
}

export function AssigneeSelect({ value, onChange, users, loading }: { value: string; onChange: (value: string) => void; users: OrgUser[]; loading: boolean }) {
  return (
    <div style={SELECT_WRAP}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
        style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
      >
        <option value="">Unassigned</option>
        {users.map((user) => (
          <option key={user.clerkId} value={user.clerkId}>{user.name || user.clerkId}</option>
        ))}
      </select>
      {CHEVRON}
    </div>
  )
}

const PRIORITY_META: Record<MaintenancePriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#22c55e' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
}
const PRIORITY_ORDER: MaintenancePriority[] = ['low', 'medium', 'high']

export function PrioritySelector({ value, onChange }: { value: MaintenancePriority; onChange: (value: MaintenancePriority) => void }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {PRIORITY_ORDER.map((key) => {
        const meta = PRIORITY_META[key]
        const on = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{ flex: 1, padding: '11px 6px', border: `1.5px solid ${on ? meta.color : 'var(--app-border-strong)'}`, borderRadius: '11px', background: on ? meta.color : 'var(--app-surface)', color: on ? '#fff' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            {meta.label}
          </button>
        )
      })}
    </div>
  )
}

/** Weekly frequency (Once/Twice/Thrice) + Mon–Sun multi-select. */
export function WeekdayPicker({ weekdays, onChange }: { weekdays: number[]; onChange: (weekdays: number[]) => void }) {
  const count = weekdays.length

  function toggle(day: number) {
    onChange(weekdays.includes(day) ? weekdays.filter((d) => d !== day) : [...weekdays, day].sort((a, b) => a - b))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {WEEKLY_FREQUENCIES.map((freq) => {
          const on = count === freq.times
          return (
            <div key={freq.times} style={{ flex: 1, padding: '8px 6px', textAlign: 'center', borderRadius: '10px', border: `1.5px solid ${on ? 'var(--app-brand-soft)' : 'var(--app-border)'}`, background: on ? 'var(--app-chip-bg)' : 'var(--app-surface-2)', color: on ? 'var(--app-brand)' : 'var(--app-text-soft)', fontSize: '12.5px', fontWeight: 600 }}>
              {freq.label}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {WEEKDAYS.map((day) => {
          const on = weekdays.includes(day.value)
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggle(day.value)}
              style={{ flex: '1 1 0', minWidth: '40px', padding: '9px 4px', borderRadius: '10px', border: `1.5px solid ${on ? '#8b5cf6' : 'var(--app-border-strong)'}`, background: on ? 'rgba(139,92,246,0.13)' : 'var(--app-surface)', color: on ? '#7c3aed' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
            >
              {day.short}
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--app-text-soft)', marginTop: '9px' }}>
        Pick the day{count === 1 ? '' : 's'} of the week — {count || 'no'} selected.
      </div>
    </div>
  )
}
