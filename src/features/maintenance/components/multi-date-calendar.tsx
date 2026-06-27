'use client'

import { useEffect, useState } from 'react'

import { formatDate, todayIso } from '../maintenance.view'

interface MultiDateCalendarProps {
  value: string[]
  onChange: (dates: string[]) => void
}

const WEEKDAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function iso(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Tiny dependency-free month calendar with multi-date selection, themed with
 * `--app-*` tokens (so it follows dark mode — a CSS lib calendar would not).
 * Past dates are disabled. Controlled: emits the full selected ISO-date array.
 */
export function MultiDateCalendar({ value, onChange }: MultiDateCalendarProps) {
  const today = todayIso()
  const [cursor, setCursor] = useState(() => {
    const base = value[0] ?? today
    const date = new Date(`${base}T00:00:00.000Z`)
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
  })

  const firstOfMonth = new Date(Date.UTC(cursor.year, cursor.month, 1))
  const leadingBlanks = (firstOfMonth.getUTCDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate()
  const selected = new Set(value)

  const monthLabel = firstOfMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const next = new Date(Date.UTC(current.year, current.month + delta, 1))
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() }
    })
  }

  function toggle(dateIso: string) {
    onChange(
      selected.has(dateIso)
        ? value.filter((d) => d !== dateIso)
        : [...value, dateIso].sort(),
    )
  }

  const navBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: '9px',
    border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)',
    color: 'var(--app-text-muted)', cursor: 'pointer',
  }

  return (
    <div style={{ border: '1px solid var(--app-border-strong)', borderRadius: '12px', padding: '12px', background: 'var(--app-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} style={navBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)' }}>{monthLabel}</span>
        <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} style={navBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
        {WEEKDAY_HEADERS.map((label) => (
          <div key={label} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--app-text-faint)', padding: '4px 0' }}>{label}</div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => <div key={`blank-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1
          const dateIso = iso(cursor.year, cursor.month, day)
          const isPast = dateIso < today
          const on = selected.has(dateIso)
          return (
            <button
              key={dateIso}
              type="button"
              disabled={isPast}
              onClick={() => toggle(dateIso)}
              style={{
                aspectRatio: '1', borderRadius: '9px', border: 'none', cursor: isPast ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontSize: '13px', fontWeight: on ? 700 : 500,
                background: on ? 'linear-gradient(150deg,#3fb0f0,#0a6cc4)' : 'transparent',
                color: on ? '#fff' : isPast ? 'var(--app-text-faint)' : 'var(--app-text)',
                opacity: isPast ? 0.45 : 1,
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface MultiDateCalendarPopoverProps extends MultiDateCalendarProps {
  disabled?: boolean
}

/**
 * Trigger button + centered pop-up wrapping {@link MultiDateCalendar}. Rendered
 * as a fixed overlay (above the form dialog) so the calendar isn't clipped by
 * the dialog's `overflow: hidden`.
 */
export function MultiDateCalendarPopover({ value, onChange, disabled }: MultiDateCalendarPopoverProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const summary =
    value.length === 0
      ? 'Pick date(s)…'
      : value.length <= 2
        ? value.map(formatDate).join(', ')
        : `${value.length} dates selected`

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%', padding: '11px 14px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface)', color: value.length === 0 ? 'var(--app-text-faint)' : 'var(--app-text)', fontFamily: 'inherit', fontSize: '14px', cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" style={{ flex: 'none', color: 'var(--app-text-soft)' }}><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>
      </button>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'var(--app-overlay)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ width: '100%', maxWidth: '340px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '18px', boxShadow: '0 30px 70px rgba(7,40,70,0.4)', padding: '16px', animation: 'floatUp .2s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--app-text)' }}>Pick date(s)</span>
              <span style={{ fontSize: '12px', color: 'var(--app-text-soft)' }}>{value.length} selected</span>
            </div>
            <MultiDateCalendar value={value} onChange={onChange} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button type="button" onClick={() => onChange([])} disabled={value.length === 0} style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: value.length === 0 ? 'var(--app-text-faint)' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, cursor: value.length === 0 ? 'not-allowed' : 'pointer' }}>Clear</button>
              <button type="button" onClick={() => setOpen(false)} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Done</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
