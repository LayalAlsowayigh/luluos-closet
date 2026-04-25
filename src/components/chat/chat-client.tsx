'use client'
import { useState, useRef, useEffect } from 'react'
import { useCloset } from '@/hooks/use-closet'

type Msg = { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'How do I dress for a job interview?',
  'What basics should every wardrobe have?',
  'How can I make my outfits look more expensive?',
  'How do I build a capsule wardrobe?',
]

export function ChatClient() {
  const { closet } = useCloset()
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hello. I am your personal stylist. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  async function send(text?: string) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    const updated: Msg[] = [...messages, { role: 'user', content: msg }]
    setMessages(updated)
    setLoading(true)
    setStreamText('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages }),
      })
      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        full += chunk
        setStreamText(full)
      }
      setMessages(m => [...m, { role: 'assistant', content: full }])
      setStreamText('')
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Unable to respond. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, height: 'calc(100vh - 200px)', minHeight: 520 }}>
      {/* Sidebar */}
      <div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 24 }}>Stylist Chat</h1>
        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 10 }}>Suggested Topics</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {STARTERS.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{ padding: '11px 14px', background: 'none', border: '1px solid #e5e5e5', textAlign: 'left', fontSize: 12, color: '#737373', cursor: 'pointer', lineHeight: 1.5, transition: 'all 0.15s', fontFamily: 'inherit' }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'; (e.currentTarget as HTMLButtonElement).style.color = '#0a0a0a' }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#737373' }}>
              {s}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: '14px 16px', background: '#f5f5f5' }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 4 }}>Wardrobe Context</p>
          <p style={{ fontSize: 11, color: '#a3a3a3' }}>{closet.length} items. AI is aware of your wardrobe.</p>
        </div>
      </div>

      {/* Chat */}
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e5e5e5' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 30, height: 30, background: m.role === 'user' ? '#0a0a0a' : '#f5f5f5', border: '1px solid #e5e5e5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {m.role === 'user' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>}
              </div>
              <div style={{ maxWidth: '72%', padding: '11px 16px', background: m.role === 'user' ? '#0a0a0a' : '#ffffff', border: m.role === 'user' ? 'none' : '1px solid #e5e5e5' }}>
                <p style={{ fontSize: 13, color: m.role === 'user' ? '#ffffff' : '#0a0a0a', lineHeight: 1.7 }}>{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, background: '#f5f5f5', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <div style={{ maxWidth: '72%', padding: '11px 16px', border: '1px solid #e5e5e5', background: '#ffffff' }}>
                {streamText ? <p style={{ fontSize: 13, color: '#0a0a0a', lineHeight: 1.7 }}>{streamText}</p> : (
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[0, 0.2, 0.4].map(d => <div key={d} style={{ width: 6, height: 6, background: '#e5e5e5', borderRadius: '50%', animation: `pulse 1s ${d}s ease-in-out infinite` }} />)}
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ borderTop: '1px solid #e5e5e5', padding: 16, display: 'flex', gap: 12 }}>
          <input style={{ flex: 1, padding: '11px 16px', border: '1.5px solid #e5e5e5', background: '#ffffff', fontSize: 13, color: '#0a0a0a', outline: 'none', fontFamily: 'inherit' }} placeholder="Ask your stylist..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} disabled={loading} />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '11px 22px', background: '#0a0a0a', color: '#ffffff', border: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1, fontFamily: 'inherit' }}>Send</button>
        </div>
      </div>
    </div>
  )
}
