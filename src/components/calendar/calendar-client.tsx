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
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

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
      .then(data => { if (Array.isArray(data)) setEntries(data) })
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
          return [...filtered, { id: data.id || selectedDate, date: selectedDate, itemIds: selectedItems, note }]
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

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  const categories = ['All', ...Array.from(new Set(closet.map(i => i.category)))]
  const filteredCloset = filterCat === 'All' ? closet : closet.filter(i => i.category === filterCat)
  const selectedItemObjects = selectedItems.map(id => closet.find(i => i.id === id)).filter(Boolean)

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 4 }}>
            Outfit Calendar
          </h1>
          <p style={{ fontSize: 11, color: '#a3a3a3', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Plan your looks
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={prevMonth} style={{ width: 36, height: 36, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>‹</button>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', minWidth: 160, textAlign: 'center' }}>
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ width: 36, height: 36, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 1 }}>
        {DAYS.map(d => (
          <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: '#e5e5e5' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} style={{ background: '#fafafa', minHeight: 100 }} />
          const dateStr = formatDate(year, month, day)
          const entry = getEntryForDate(dateStr)
          const isToday = dateStr === todayStr
          const entryItems = entry ? entry.itemIds.map(id => closet.find(c => c.id === id)).filter(Boolean) : []

          return (
            <div key={i} onClick={() => openDay(dateStr)}
              style={{ background: '#ffffff', minHeight: 100, padding: 8, cursor: 'pointer', position: 'relative', transition: 'background 0.15s', borderTop: isToday ? '2px solid #0a0a0a' : '2px solid transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}>
              {/* Day number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: isToday ? 13 : 12, fontWeight: isToday ? 700 : 400, color: isToday ? '#0a0a0a' : '#737373', background: isToday ? '#0a0a0a' : 'transparent', width: isToday ? 24 : 'auto', height: isToday ? 24 : 'auto', borderRadius: isToday ? '50%' : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {day}
                </span>
                {!entry && (
                  <span style={{ fontSize: 16, color: '#d4d4d4', lineHeight: 1 }}>+</span>
                )}
              </div>

              {/* Outfit items preview */}
              {entryItems.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {entryItems.slice(0, 4).map((item: any, j: number) => (
                    <div key={j} style={{ width: 28, height: 28, background: '#f5f5f5', overflow: 'hidden', flexShrink: 0 }}>
                      {item.imageBase64
                        ? <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: '#e5e5e5' }} />
                      }
                    </div>
                  ))}
                  {entryItems.length > 4 && (
                    <div style={{ width: 28, height: 28, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#737373', fontWeight: 600 }}>
                      +{entryItems.length - 4}
                    </div>
                  )}
                </div>
              )}

              {entry?.note && (
                <p style={{ fontSize: 9, color: '#a3a3a3', marginTop: 4, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.note}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0a0a0a' }} />
          <span style={{ fontSize: 11, color: '#a3a3a3' }}>Today</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 12, height: 12, background: '#f5f5f5', border: '1px solid #e5e5e5' }} />
          <span style={{ fontSize: 11, color: '#a3a3a3' }}>Outfit planned</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#d4d4d4' }}>+</span>
          <span style={{ fontSize: 11, color: '#a3a3a3' }}>Click to add outfit</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 10, color: '#a3a3a3', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a' }}>
                  {selectedItemObjects.length > 0 ? 'Edit Outfit' : 'Plan Your Outfit'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</button>
            </div>

            {/* Selected items preview */}
            {selectedItemObjects.length > 0 && (
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e5e5', flexShrink: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 10 }}>Selected ({selectedItemObjects.length})</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                  {selectedItemObjects.map((item: any) => (
                    <div key={item.id} onClick={() => toggleItem(item.id)}
                      style={{ flexShrink: 0, width: 60, cursor: 'pointer', position: 'relative' }}>
                      <div style={{ width: 60, height: 80, background: '#f5f5f5', overflow: 'hidden', border: '2px solid #0a0a0a' }}>
                        {item.imageBase64
                          ? <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', background: '#e5e5e5' }} />
                        }
                      </div>
                      <div style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#0a0a0a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>✕</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category filter */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  style={{ padding: '6px 14px', border: `1.5px solid ${filterCat === cat ? '#0a0a0a' : '#e5e5e5'}`, background: filterCat === cat ? '#0a0a0a' : '#fff', color: filterCat === cat ? '#fff' : '#737373', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Closet grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {filteredCloset.length === 0 ? (
                <p style={{ fontSize: 13, color: '#a3a3a3', textAlign: 'center', padding: 24 }}>No items in this category</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
                  {filteredCloset.map(item => {
                    const isSelected = selectedItems.includes(item.id)
                    return (
                      <div key={item.id} onClick={() => toggleItem(item.id)}
                        style={{ cursor: 'pointer', border: `2px solid ${isSelected ? '#0a0a0a' : 'transparent'}`, transition: 'border 0.15s', position: 'relative' }}>
                        <div style={{ aspectRatio: '3/4', background: '#f5f5f5', overflow: 'hidden' }}>
                          {item.imageBase64
                            ? <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 20, color: '#d4d4d4' }}>?</span></div>
                          }
                        </div>
                        <p style={{ fontSize: 9, fontWeight: 600, color: '#0a0a0a', padding: '4px 4px 6px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                        {isSelected && (
                          <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, background: '#0a0a0a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}>✓</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Note + actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e5e5', flexShrink: 0 }}>
              <input
                placeholder="Add a note (optional)..."
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e5e5', background: '#ffffff', fontFamily: 'inherit', fontSize: 13, color: '#0a0a0a', marginBottom: 12, outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveEntry} disabled={saving}
                  style={{ flex: 1, padding: '12px', background: '#0a0a0a', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {saving ? 'Saving...' : 'Save Outfit'}
                </button>
                {getEntryForDate(selectedDate) && (
                  <button onClick={clearEntry}
                    style={{ padding: '12px 20px', border: '1.5px solid #e5e5e5', background: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', color: '#737373', fontFamily: 'inherit' }}>
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