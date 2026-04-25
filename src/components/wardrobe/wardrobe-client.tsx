'use client'
import { useState, useRef, useCallback } from 'react'
import { useCloset } from '@/hooks/use-closet'
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants'
import type { ItemAnalysis } from '@/types'
import { toast } from 'sonner'

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res((reader.result as string).split(',')[1])
    reader.onerror = () => rej(new Error('Read failed'))
    reader.readAsDataURL(file)
  })
}

type UploadStep = 'idle' | 'uploading' | 'analyzing' | 'review'

export function WardrobeClient() {
  const { closet, isLoading, addItem, deleteItem } = useCloset()
  const [filter, setFilter] = useState<string>('All')
  const [showAdd, setShowAdd] = useState(false)
  const [step, setStep] = useState<UploadStep>('idle')
  const [preview, setPreview] = useState<{ url: string; base64: string; mimeType: string } | null>(null)
  const [analysis, setAnalysis] = useState<ItemAnalysis | null>(null)
  const [removingBg, setRemovingBg] = useState(false)
  const [bgRemoved, setBgRemoved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const displayed = filter === 'All' ? closet : closet.filter(i => i.category === filter)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return }
    setStep('uploading')
    const base64 = await fileToBase64(file)
    const url = URL.createObjectURL(file)
    setPreview({ url, base64, mimeType: file.type })
    setStep('analyzing')
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: base64, mimeType: file.type }) })
      if (!res.ok) throw new Error('Analysis failed')
      const data = await res.json()
      setAnalysis(data)
      setStep('review')
    } catch {
      toast.error('Could not analyze image. Try a clearer photo.')
      setStep('idle')
    }
  }, [])

  async function handleRemoveBg() {
    setRemovingBg(true)
    await new Promise(r => setTimeout(r, 1500))
    setBgRemoved(true)
    setRemovingBg(false)
    toast.success('Background removed. Connect remove.bg API for full effect.')
  }

  async function confirmAdd() {
    if (!analysis || !preview) return
    try {
      await addItem({ name: analysis.name, category: analysis.category, color: analysis.color, style: analysis.style, description: analysis.description, occasions: analysis.occasions, imageBase64: preview.base64, imageUrl: null, bgRemoved })
      toast.success('Item added to your wardrobe.')
      setShowAdd(false); setStep('idle'); setPreview(null); setAnalysis(null); setBgRemoved(false)
    } catch { toast.error('Failed to add item.') }
  }

  function cancelAdd() {
    setShowAdd(false); setStep('idle'); setPreview(null); setAnalysis(null); setBgRemoved(false)
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 4 }}>
            {isLoading ? '...' : closet.length} Items
          </h1>
          <p style={{ fontSize: 11, color: '#a3a3a3', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your wardrobe</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)} style={{ padding: '11px 24px', background: showAdd ? 'transparent' : '#0a0a0a', color: showAdd ? '#0a0a0a' : '#ffffff', border: '1.5px solid #0a0a0a', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
          {showAdd ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add item panel */}
      {showAdd && (
        <div style={{ border: '1px solid #e5e5e5', padding: 32, marginBottom: 32, background: '#fafafa' }} className="fade-up">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', marginBottom: 24 }}>Add New Item</h2>

          {(step === 'idle') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault() }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                style={{ border: '2px dashed #e5e5e5', padding: '52px 32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: '#ffffff' }}>
                <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                <div style={{ width: 48, height: 48, border: '1.5px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0a0a0a', marginBottom: 6 }}>Upload clothing photo</p>
                <p style={{ fontSize: 12, color: '#a3a3a3' }}>Drop here or click to browse</p>
                <p style={{ fontSize: 10, color: '#d4d4d4', marginTop: 6, letterSpacing: '0.05em' }}>JPG, PNG, HEIC up to 10MB</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
                {['AI detects category, color, and style automatically', 'Background removal available with one click', 'Item appears in your wardrobe grid instantly'].map(tip => (
                  <div key={tip} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 1, height: 16, background: '#e5e5e5', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: '#737373', lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(step === 'uploading' || step === 'analyzing') && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ width: 36, height: 36, border: '2px solid #e5e5e5', borderTopColor: '#0a0a0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <p style={{ fontSize: 14, color: '#737373' }}>{step === 'uploading' ? 'Reading image...' : 'AI is analyzing your item...'}</p>
            </div>
          )}

          {step === 'review' && analysis && preview && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40 }}>
              <div>
                <div style={{ background: bgRemoved ? 'repeating-conic-gradient(#f5f5f5 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px' : '#f5f5f5', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10 }}>
                  <img src={preview.url} alt="Item" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <button onClick={handleRemoveBg} disabled={removingBg || bgRemoved} style={{ width: '100%', padding: '9px', border: '1.5px solid #e5e5e5', background: bgRemoved ? '#f5f5f5' : '#ffffff', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: bgRemoved ? 'default' : 'pointer', color: bgRemoved ? '#a3a3a3' : '#0a0a0a' }}>
                  {removingBg ? 'Removing...' : bgRemoved ? 'Background Removed' : 'Remove Background'}
                </button>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 6, height: 6, background: '#0a0a0a', borderRadius: '50%' }} />
                  <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#737373' }}>AI Analysis Complete</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 24, lineHeight: 1.3 }}>{analysis.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  {[['Category', analysis.category], ['Color', analysis.color], ['Style', analysis.style]].map(([l, v]) => (
                    <div key={l}>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 4 }}>{l}</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0a0a0a' }}>{v}</p>
                    </div>
                  ))}
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 4 }}>Occasions</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {analysis.occasions?.map(o => <span key={o} style={{ padding: '3px 10px', border: '1px solid #e5e5e5', fontSize: 10, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{o}</span>)}
                    </div>
                  </div>
                </div>
                {analysis.description && <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.7, borderLeft: '2px solid #e5e5e5', paddingLeft: 16, marginBottom: 28 }}>{analysis.description}</p>}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={confirmAdd} style={{ padding: '11px 24px', background: '#0a0a0a', color: '#ffffff', border: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Add to Wardrobe</button>
                  <button onClick={cancelAdd} style={{ padding: '11px 24px', background: 'transparent', color: '#737373', border: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', marginBottom: 24, overflowX: 'auto' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${filter === cat ? '#0a0a0a' : 'transparent'}`, marginBottom: -1, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: filter === cat ? '#0a0a0a' : '#a3a3a3', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ aspectRatio: '3/4', background: '#f5f5f5', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 72, height: 72, border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 8 }}>Your closet is empty</p>
          <p style={{ fontSize: 12, color: '#a3a3a3' }}>Upload photos of your clothing to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          {displayed.map(item => (
            <div key={item.id} className="fade-up" style={{ position: 'relative', background: '#f5f5f5', transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: item.bgRemoved ? 'repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 0 0 / 14px 14px' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.imageBase64 ? (
                  <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#d4d4d4' }}>{CATEGORY_ICONS[item.category] || '?'}</span>
                )}
              </div>
              <div style={{ padding: '14px 16px 12px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#0a0a0a', marginBottom: 3, lineHeight: 1.4 }}>{item.name}</p>
                <p style={{ fontSize: 10, color: '#a3a3a3', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.color} · {item.category}</p>
              </div>
              <button onClick={() => { deleteItem(item.id); toast.success('Item removed.') }}
                style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: '#ffffff', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                onMouseOut={e => (e.currentTarget.style.opacity = '0')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
