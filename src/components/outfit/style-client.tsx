'use client'
import { useState } from 'react'
import { useCloset } from '@/hooks/use-closet'
import { useOutfits } from '@/hooks/use-outfits'
import { OCCASIONS, WEATHER_OPTIONS, CATEGORY_ICONS } from '@/lib/constants'
import type { OutfitSuggestion } from '@/types'
import { toast } from 'sonner'

type View = 'generate' | 'tryon' | 'history'

export function StyleClient() {
  const { closet } = useCloset()
  const { history, isLoading: histLoading, generateOutfit } = useOutfits()
  const [view, setView] = useState<View>('generate')
  const [occasion, setOccasion] = useState('Casual')
  const [weather, setWeather] = useState('Mild')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OutfitSuggestion | null>(null)
  const [tryOnItem, setTryOnItem] = useState<string | null>(null)
  const [tryOnLoading, setTryOnLoading] = useState(false)
  const [tryOnDone, setTryOnDone] = useState(false)

  const itemsWithPhotos = closet.filter(i => i.imageBase64)
  const selectedItemObjects = result ? closet.filter(c => result.selectedItems.some(s => c.name.toLowerCase().includes(s.toLowerCase().split(' ')[0]))) : []

  async function handleGenerate() {
    if (closet.length < 3) { toast.error('Add at least 3 items to your wardrobe first.'); return }
    setLoading(true); setResult(null)
    try {
      const suggestion = await generateOutfit(occasion, weather)
      setResult(suggestion)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not generate outfit. Try again.')
    }
    setLoading(false)
  }

  async function handleTryOn(itemId: string) {
    setTryOnItem(itemId); setTryOnDone(false); setTryOnLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setTryOnLoading(false); setTryOnDone(true)
  }

  const SUB_TABS: [View, string][] = [['generate', 'AI Outfit'], ['tryon', 'Virtual Try-On'], ['history', `History (${history.length})`]]

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', marginBottom: 36 }}>
        {SUB_TABS.map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{ padding: '10px 24px', background: 'none', border: 'none', borderBottom: `2px solid ${view === k ? '#0a0a0a' : 'transparent'}`, marginBottom: -1, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: view === k ? '#0a0a0a' : '#a3a3a3', cursor: 'pointer', transition: 'all 0.15s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Generate */}
      {view === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48 }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 28, lineHeight: 1.3 }}>Generate an Outfit</h1>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 8 }}>Occasion</p>
              <select value={occasion} onChange={e => setOccasion(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e5e5', background: '#ffffff', fontSize: 13, color: '#0a0a0a', appearance: 'none', cursor: 'pointer' }}>
                {OCCASIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 8 }}>Weather</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {WEATHER_OPTIONS.map(w => (
                  <button key={w} onClick={() => setWeather(w)} style={{ padding: '7px 14px', border: `1.5px solid ${weather === w ? '#0a0a0a' : '#e5e5e5'}`, background: weather === w ? '#0a0a0a' : '#ffffff', color: weather === w ? '#ffffff' : '#737373', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: '13px', background: '#0a0a0a', color: '#ffffff', border: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Styling...' : 'Generate Outfit'}
            </button>
            <div style={{ marginTop: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 10 }}>Your Wardrobe ({closet.length})</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
                {closet.slice(0, 6).map(item => (
                  <div key={item.id} style={{ aspectRatio: '1', background: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageBase64 ? <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16, fontWeight: 700, color: '#d4d4d4' }}>{CATEGORY_ICONS[item.category]}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                <div style={{ width: 40, height: 40, border: '2px solid #e5e5e5', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 20 }} />
                <p style={{ fontSize: 13, color: '#737373' }}>AI is styling your outfit...</p>
              </div>
            )}
            {!loading && !result && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, border: '1px dashed #e5e5e5' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 8 }}>No outfit generated yet</p>
                <p style={{ fontSize: 12, color: '#a3a3a3' }}>Select occasion and weather, then click Generate</p>
              </div>
            )}
            {result && !loading && (
              <div className="fade-up">
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 10, color: '#a3a3a3', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{occasion} · {weather}</p>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', lineHeight: 1.2, marginBottom: 12 }}>{result.outfitTitle}</h2>
                  <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.7, maxWidth: 480 }}>{result.rationale}</p>
                </div>
                {selectedItemObjects.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 12 }}>Selected from your wardrobe</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {selectedItemObjects.map(item => (
                        <div key={item.id} style={{ width: 110 }}>
                          <div style={{ aspectRatio: '3/4', background: '#f5f5f5', overflow: 'hidden', marginBottom: 8 }}>
                            {item.imageBase64 ? <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontWeight: 700, fontSize: 24, color: '#d4d4d4' }}>{CATEGORY_ICONS[item.category]}</span></div>}
                          </div>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#0a0a0a', lineHeight: 1.4 }}>{item.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: 20, marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 10 }}>Complete Look</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.selectedItems.map((item, i) => <span key={i} style={{ padding: '5px 12px', border: '1px solid #e5e5e5', fontSize: 11, color: '#737373', letterSpacing: '0.04em' }}>{item}</span>)}
                  </div>
                </div>
                {result.colorNarrative && <div style={{ borderLeft: '2px solid #0a0a0a', paddingLeft: 16, marginBottom: 16 }}><p style={{ fontSize: 12, color: '#737373', lineHeight: 1.7 }}>{result.colorNarrative}</p></div>}
                {result.stylingTip && <div style={{ background: '#f5f5f5', padding: '14px 16px', marginBottom: 20 }}><p style={{ fontSize: 10, fontWeight: 600, color: '#a3a3a3', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Styling Note</p><p style={{ fontSize: 12, color: '#0a0a0a' }}>{result.stylingTip}</p></div>}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleGenerate} style={{ padding: '10px 22px', border: '1.5px solid #0a0a0a', background: 'transparent', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', color: '#0a0a0a' }}>Regenerate</button>
                  <button onClick={() => setView('tryon')} style={{ padding: '10px 22px', background: '#0a0a0a', color: '#ffffff', border: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Virtual Try-On</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Virtual Try-On */}
      {view === 'tryon' && (
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 8 }}>Virtual Try-On</h1>
          <p style={{ fontSize: 12, color: '#a3a3a3', marginBottom: 32 }}>Select an item to see it on a model. Connect Fashn.ai for photorealistic results.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 12 }}>Select Item</p>
              {itemsWithPhotos.length === 0 ? (
                <div style={{ border: '1px dashed #e5e5e5', padding: 32, textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#737373' }}>Upload clothing photos to use Virtual Try-On</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                  {itemsWithPhotos.map(item => (
                    <div key={item.id} onClick={() => handleTryOn(item.id)} style={{ cursor: 'pointer', border: `2px solid ${tryOnItem === item.id ? '#0a0a0a' : 'transparent'}`, transition: 'border 0.2s' }}>
                      <div style={{ aspectRatio: '3/4', background: '#f5f5f5', overflow: 'hidden' }}>
                        <img src={`data:image/jpeg;base64,${item.imageBase64!}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#0a0a0a', padding: '6px 6px 8px', lineHeight: 1.3 }}>{item.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 12 }}>Model Preview</p>
              <div style={{ border: '1px solid #e5e5e5', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                {!tryOnItem && !tryOnLoading && <p style={{ fontSize: 12, color: '#a3a3a3' }}>Select an item to preview</p>}
                {tryOnLoading && <div style={{ textAlign: 'center' }}><div style={{ width: 32, height: 32, border: '2px solid #e5e5e5', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} /><p style={{ fontSize: 12, color: '#737373' }}>Generating try-on...</p></div>}
                {tryOnDone && !tryOnLoading && (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <svg width="80" height="160" viewBox="0 0 80 160" fill="none">
                      <ellipse cx="40" cy="22" rx="18" ry="20" fill="#e5e5e5"/>
                      <rect x="32" y="40" width="16" height="14" fill="#e5e5e5"/>
                      <path d="M16 54 Q40 48 64 54 L68 110 Q40 116 12 110 Z" fill="#0a0a0a"/>
                      <path d="M16 58 L4 95" stroke="#e5e5e5" strokeWidth="12" strokeLinecap="round"/>
                      <path d="M64 58 L76 95" stroke="#e5e5e5" strokeWidth="12" strokeLinecap="round"/>
                      <rect x="20" y="110" width="16" height="44" rx="3" fill="#d4d4d4"/>
                      <rect x="44" y="110" width="16" height="44" rx="3" fill="#d4d4d4"/>
                    </svg>
                    <p style={{ fontSize: 11, color: '#737373', marginTop: 16, lineHeight: 1.5 }}>Connect Fashn.ai or Replicate VITON-HD for photorealistic try-on</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {view === 'history' && (
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 28 }}>Outfit History</h1>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed #e5e5e5' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 8 }}>No outfits yet</p>
              <p style={{ fontSize: 12, color: '#a3a3a3' }}>Generate your first outfit to see it here</p>
            </div>
          ) : history.map((h, i) => (
            <div key={h.id} style={{ padding: '24px 0', borderBottom: '1px solid #e5e5e5', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {[h.occasion, h.weather, new Date(h.createdAt).toLocaleDateString()].map((t, j) => <span key={j} style={{ padding: '3px 10px', border: '1px solid #e5e5e5', fontSize: 10, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t}</span>)}
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 10 }}>{h.title}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {h.items.map((item, j) => <span key={j} style={{ padding: '3px 10px', border: '1px solid #e5e5e5', fontSize: 10, color: '#737373' }}>{item}</span>)}
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#d4d4d4' }}>#{i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
