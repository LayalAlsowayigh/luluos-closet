'use client'
import { useState, useRef, useCallback } from 'react'
import { useCloset } from '@/hooks/use-closet'
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants'
import type { ItemAnalysis } from '@/types'
import { toast } from 'sonner'

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    const img = new Image()
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) { rej(new Error('Canvas failed')); return }
        ctx.drawImage(img, 0, 0)
        res(canvas.toDataURL('image/png').split(',')[1])
      }
      img.onerror = () => rej(new Error('Image load failed'))
      img.src = reader.result as string
    }
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
    setPreview({ url, base64, mimeType: 'image/png' })
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
    if (!preview) return
    setRemovingBg(true)
    try {
      const res = await fetch('/api/remove-bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: preview.base64 }) })
      if (!res.ok) throw new Error('remove.bg failed')
      const blob = await res.blob()
      const cleanUrl = URL.createObjectURL(blob)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]
        setPreview(prev => prev ? { ...prev, url: cleanUrl, base64, mimeType: 'image/png' } : null)
      }
      reader.readAsDataURL(blob)
      setBgRemoved(true)
      toast.success('Background removed successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove background')
    }
    setRemovingBg(false)
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
    <div style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 4 }}>
            {isLoading ? '...' : closet.length} Items
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your wardrobe</p>
        </div>
        <button onClick={() => setShowAdd(s => !s)} style={{ padding: '11px 24px', background: showAdd ? 'transparent' : 'var(--text-primary)', color: showAdd ? 'var(--text-primary)' : 'var(--bg)', border: '1.5px solid var(--text-primary)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
          {showAdd ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showAdd && (
        <div style={{ border: '1px solid var(--border)', padding: 32, marginBottom: 32, background: 'var(--bg-secondary)' }} className="fade-up">
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', marginBottom: 24, color: 'var(--text-primary)' }}>Add New Item</h2>
          {step === 'idle' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                style={{ border: '2px dashed var(--border)', padding: '52px 32px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg)' }}>
                <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                <div style={{ width: 48, height: 48, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Upload clothing photo</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Drop here or click to browse</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
                {['AI detects category, color, and style automatically', 'Background removal available with one click', 'Item appears in your wardrobe grid instantly'].map(tip => (
                  <div key={tip} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 1, height: 16, background: 'var(--border)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(step === 'uploading' || step === 'analyzing') && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ width: 36, height: 36, border: '2px solid var(--border)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{step === 'uploading' ? 'Reading image...' : 'AI is analyzing your item...'}</p>
            </div>
          )}
          {step === 'review' && analysis && preview && (
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40 }}>
              <div>
                <div style={{ background: bgRemoved ? 'repeating-conic-gradient(#f5f5f5 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px' : 'var(--bg-tertiary)', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 10 }}>
                  <img src={preview.url} alt="Item" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <button onClick={handleRemoveBg} disabled={removingBg || bgRemoved} style={{ width: '100%', padding: '9px', border: '1.5px solid var(--border)', background: bgRemoved ? 'var(--bg-tertiary)' : 'var(--bg)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: bgRemoved ? 'default' : 'pointer', color: bgRemoved ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {removingBg ? 'Removing...' : bgRemoved ? 'Background Removed' : 'Remove Background'}
                </button>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 6, height: 6, background: 'var(--text-primary)', borderRadius: '50%' }} />
                  <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>AI Analysis Complete</span>
                </div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 24, lineHeight: 1.3 }}>{analysis.name}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  {[['Category', analysis.category], ['Color', analysis.color], ['Style', analysis.style]].map(([l, v]) => (
                    <div key={l}>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>{l}</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{v}</p>
                    </div>
                  ))}
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Occasions</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {analysis.occasions?.map(o => <span key={o} style={{ padding: '3px 10px', border: '1px solid var(--border)', fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{o}</span>)}
                    </div>
                  </div>
                </div>
                {analysis.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: '2px solid var(--border)', paddingLeft: 16, marginBottom: 28 }}>{analysis.description}</p>}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={confirmAdd} style={{ padding: '11px 24px', background: 'var(--text-primary)', color: 'var(--bg)', border: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Add to Wardrobe</button>
                  <button onClick={cancelAdd} style={{ padding: '11px 24px', background: 'transparent', color: 'var(--text-secondary)', border: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto' }}>
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${filter === cat ? 'var(--text-primary)' : 'transparent'}`, marginBottom: -1, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: filter === cat ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ aspectRatio: '3/4', background: 'var(--bg-tertiary)', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 72, height: 72, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 8 }}>Your closet is empty</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upload photos of your clothing to get started</p>
        </div>
      ) : (
        <div className="wardrobe-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          {displayed.map(item => (
            <div key={item.id} className="fade-up" style={{ position: 'relative', background: 'var(--bg-tertiary)', transition: 'all 0.2s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ aspectRatio: '3/4', overflow: 'hidden', background: item.bgRemoved ? 'repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 0 0 / 14px 14px' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.imageBase64
                  ? <img src={`data:image/jpeg;base64,${item.imageBase64}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-faint)' }}>{CATEGORY_ICONS[item.category] || '?'}</span>}
              </div>
              <div style={{ padding: '14px 16px 12px', background: 'var(--card-bg)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4 }}>{item.name}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.color} · {item.category}</p>
              </div>
              <button onClick={() => { deleteItem(item.id); toast.success('Item removed.') }}
                style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
