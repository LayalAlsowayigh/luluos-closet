'use client'
import { useState } from 'react'
import { useCloset } from '@/hooks/use-closet'
import { useOutfits } from '@/hooks/use-outfits'
import { OCCASIONS, WEATHER_OPTIONS, CATEGORY_ICONS } from '@/lib/constants'
import type { OutfitSuggestion } from '@/types'
import { toast } from 'sonner'

type View = 'generate' | 'tryon' | 'history'
type ModelType = 'female' | 'male'
type ClothCategory = 'upper_body' | 'lower_body' | 'dresses'

export function StyleClient() {
  const { closet } = useCloset()
  const { history, generateOutfit } = useOutfits()

  const [view, setView] = useState<View>('generate')
  const [occasion, setOccasion] = useState('Casual')
  const [weather, setWeather] = useState('Mild')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OutfitSuggestion | null>(null)

  const navBtn = (active: boolean) => ({
    padding: '10px 24px',
    background: 'none',
    border: 'none',
    borderBottom: `2px solid ${active ? 'var(--text-primary)' : 'transparent'}`,
    marginBottom: -1,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: 'pointer'
  })

  async function handleGenerate() {
    if (closet.length < 3) {
      toast.error('Add at least 3 items first.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const suggestion = await generateOutfit(occasion, weather)
      setResult(suggestion)
    } catch {
      toast.error('Failed to generate.')
    }

    setLoading(false)
  }

  return (
    <div style={{ color: 'var(--text-primary)' }}>

      {/* NAV */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 36 }}>
        {['generate', 'tryon', 'history'].map(v => (
          <button key={v} onClick={() => setView(v as View)} style={navBtn(view === v)}>
            {v}
          </button>
        ))}
      </div>

      {/* GENERATE */}
      {view === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48 }}>

          {/* LEFT PANEL */}
          <div>
            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 30,
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--text-primary)',
              marginBottom: 28
            }}>
              Generate Outfit
            </h1>

            {/* OCCASION */}
            <select
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
              style={{
                width: '100%',
                padding: '11px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-primary)'
              }}
            >
              {OCCASIONS.map(o => <option key={o}>{o}</option>)}
            </select>

            {/* WEATHER */}
            <div style={{ marginTop: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {WEATHER_OPTIONS.map(w => (
                <button
                  key={w}
                  onClick={() => setWeather(w)}
                  style={{
                    padding: '7px 14px',
                    border: `1px solid ${weather === w ? 'var(--text-primary)' : 'var(--border)'}`,
                    background: weather === w ? 'var(--text-primary)' : 'var(--bg)',
                    color: weather === w ? 'var(--bg)' : 'var(--text-secondary)'
                  }}
                >
                  {w}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              style={{
                marginTop: 20,
                width: '100%',
                padding: 12,
                background: 'var(--text-primary)',
                color: 'var(--bg)',
                border: 'none'
              }}
            >
              Generate
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div>
            {!result && !loading && (
              <div style={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed var(--border)'
              }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  No outfit yet
                </p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  border: '2px solid var(--border)',
                  borderTopColor: 'var(--text-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
              </div>
            )}

            {result && (
              <div>
                <h2 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 30,
                  fontStyle: 'italic',
                  color: 'var(--text-primary)'
                }}>
                  {result.outfitTitle}
                </h2>

                <p style={{ color: 'var(--text-secondary)' }}>
                  {result.rationale}
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}