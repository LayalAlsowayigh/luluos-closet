'use client'
import { useState, useEffect } from 'react'
import { useCloset } from '@/hooks/use-closet'
import { toast } from 'sonner'

type CalendarEntry = {
  id: string
  date: string
  itemIds: string[]
  note: string | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function today() {
  const d = new Date()
  return formatDate(d.getFullYear(), d.getMonth(), d.getDate())
}

export function CalendarClient() {
  const { closet } = useCloset()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [filterCat, setFilterCat] = useState('All')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = today()

  useEffect(() => {
    fetch('/api/calendar')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data)
      })
  }, [])

  function getEntryForDate(dateStr: string) {
    return entries.find(e => e.date === dateStr)
  }

  function openDay(dateStr: string) {
    const entry = getEntryForDate(dateStr)
    setSelectedDate(dateStr)
    setSelectedItems(entry?.itemIds || [])
    setNote(entry?.note || '')
    setShowModal(true)
  }

  function toggleItem(id: string) {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  async function saveEntry() {
    if (!selectedDate) return
    setSaving(true)

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, itemIds: selectedItems, note })
      })

      const data = await res.json()

      if (selectedItems.length === 0) {
        setEntries(prev => prev.filter(e => e.date !== selectedDate))
      } else {
        setEntries(prev => {
          const filtered = prev.filter(e => e.date !== selectedDate)
          return [
            ...filtered,
            {
              id: data.id || selectedDate,
              date: selectedDate,
              itemIds: selectedItems,
              note
            }
          ]
        })
      }

      toast.success('Outfit saved to calendar')
      setShowModal(false)
    } catch {
      toast.error('Failed to save')
    }

    setSaving(false)
  }

  async function clearEntry() {
    if (!selectedDate) return

    await fetch('/api/calendar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate })
    })

    setEntries(prev => prev.filter(e => e.date !== selectedDate))
    setShowModal(false)
    toast.success('Outfit cleared')
  }

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const categories = ['All', ...Array.from(new Set(closet.map(i => i.category)))]
  const filteredCloset =
    filterCat === 'All' ? closet : closet.filter(i => i.category === filterCat)

  const selectedItemObjects = selectedItems
    .map(id => closet.find(i => i.id === id))
    .filter(Boolean)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 4 }}>
            Outfit Calendar
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Plan your looks
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={prevMonth} style={{ width: 36, height: 36, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            ‹
          </button>

          <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', minWidth: 160, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>

          <button onClick={nextMonth} style={{ width: 36, height: 36, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            ›
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--border)' }}>
        {cells.map((day, i) => {
          if (!day) {
            return <div key={i} style={{ background: 'var(--bg-secondary)', minHeight: 100 }} />
          }

          const dateStr = formatDate(year, month, day)
          const entry = getEntryForDate(dateStr)
          const isToday = dateStr === todayStr
          const entryItems = entry
            ? entry.itemIds.map(id => closet.find(c => c.id === id)).filter(Boolean)
            : []

          return (
            <div
              key={i}
              onClick={() => openDay(dateStr)}
              style={{
                background: 'var(--card-bg)',
                minHeight: 100,
                padding: 8,
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.15s',
                borderTop: isToday ? '2px solid var(--text-primary)' : '2px solid transparent'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--card-bg)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{
                  fontSize: isToday ? 13 : 12,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? 'var(--bg)' : 'var(--text-secondary)',
                  background: isToday ? 'var(--text-primary)' : 'transparent',
                  width: isToday ? 24 : 'auto',
                  height: isToday ? 24 : 'auto',
                  borderRadius: isToday ? '50%' : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {day}
                </span>

                {!entry && (
                  <span style={{ fontSize: 16, color: 'var(--text-faint)', lineHeight: 1 }}>+</span>
                )}
              </div>

              {entryItems.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {entryItems.slice(0, 4).map((item: any, j: number) => (
                    <div key={j} style={{ width: 28, height: 28, background: 'var(--bg-tertiary)', overflow: 'hidden', flexShrink: 0 }}>
                      {item.imageBase64 ? (
                        <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--bg-tertiary)' }} />
                      )}
                    </div>
                  ))}

                  {entryItems.length > 4 && (
                    <div style={{ width: 28, height: 28, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      +{entryItems.length - 4}
                    </div>
                  )}
                </div>
              )}

              {entry?.note && (
                <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.note}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--text-primary)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Today</span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 12, height: 12, background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Outfit planned</span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: 'var(--text-faint)' }}>+</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to add outfit</span>
        </div>
      </div>

      {showModal && selectedDate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div style={{
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            width: '100%',
            maxWidth: 700,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
            border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)' }}>
                  {selectedItemObjects.length > 0 ? 'Edit Outfit' : 'Plan Your Outfit'}
                </h3>
              </div>

              <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                ✕
              </button>
            </div>

            {selectedItemObjects.length > 0 && (
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Selected ({selectedItemObjects.length})
                </p>

                <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                  {selectedItemObjects.map((item: any) => (
                    <div key={item.id} onClick={() => toggleItem(item.id)} style={{ flexShrink: 0, width: 60, cursor: 'pointer', position: 'relative' }}>
                      <div style={{ width: 60, height: 80, background: 'var(--bg-tertiary)', overflow: 'hidden', border: '2px solid var(--text-primary)' }}>
                        {item.imageBase64 ? (
                          <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--bg-tertiary)' }} />
                        )}
                      </div>

                      <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: 'var(--text-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontSize: 10 }}>
                        ✕
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  style={{
                    padding: '6px 14px',
                    border: `1.5px solid ${filterCat === cat ? 'var(--text-primary)' : 'var(--border)'}`,
                    background: filterCat === cat ? 'var(--text-primary)' : 'var(--bg)',
                    color: filterCat === cat ? 'var(--bg)' : 'var(--text-secondary)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: 'var(--bg)' }}>
              {filteredCloset.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                  No items in this category
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                  {filteredCloset.map(item => {
                    const isSelected = selectedItems.includes(item.id)

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        style={{
                          cursor: 'pointer',
                          border: `2px solid ${isSelected ? 'var(--text-primary)' : 'transparent'}`,
                          transition: 'border 0.15s',
                          position: 'relative',
                          background: 'var(--card-bg)'
                        }}
                      >
                        <div style={{ aspectRatio: '3/4', background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                          {item.imageBase64 ? (
                            <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: 20, color: 'var(--text-faint)' }}>?</span>
                            </div>
                          )}
                        </div>

                        <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-primary)', padding: '4px 4px 6px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </p>

                        {isSelected && (
                          <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, background: 'var(--text-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', fontSize: 10 }}>
                            ✓
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg)' }}>
              <input
                placeholder="Add a note (optional)..."
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg-tertiary)',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={saveEntry}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg)',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    fontFamily: 'inherit'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Outfit'}
                </button>

                {getEntryForDate(selectedDate) && (
                  <button
                    onClick={clearEntry}
                    style={{
                      padding: '12px 20px',
                      border: '1.5px solid var(--border)',
                      background: 'var(--bg)',
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontFamily: 'inherit'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}