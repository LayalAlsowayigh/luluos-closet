'use client'
import { useUser } from '@clerk/nextjs'
import { useCloset } from '@/hooks/use-closet'
import { useOutfits } from '@/hooks/use-outfits'
import { CATEGORIES } from '@/lib/constants'

export function ProfileClient() {
  const { user } = useUser()
  const { closet } = useCloset()
  const { history } = useOutfits()

  const byCat = CATEGORIES.map(c => ({ cat: c, n: closet.filter(i => i.category === c).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n)
  const colors = [...new Set(closet.map(i => i.color))]
  const styles = [...new Set(closet.map(i => i.style).filter(Boolean))]

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Profile header */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', paddingBottom: 40, borderBottom: '1px solid #e5e5e5', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {user?.imageUrl ? <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, color: '#ffffff', fontStyle: 'italic' }}>{user?.firstName?.[0] || 'U'}</span>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a' }}>{user?.fullName || user?.emailAddresses[0]?.emailAddress}</h1>
          </div>
          <p style={{ fontSize: 12, color: '#a3a3a3', marginBottom: 20 }}>{user?.emailAddresses[0]?.emailAddress}</p>
          <div style={{ display: 'flex', gap: 32 }}>
            {[{ v: closet.length, l: 'Items' }, { v: byCat.length, l: 'Categories' }, { v: history.length, l: 'Outfits' }].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, color: '#0a0a0a' }}>{v}</div>
                <div style={{ fontSize: 10, color: '#a3a3a3', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 20 }}>Wardrobe Breakdown</h2>
        {byCat.length === 0 ? <p style={{ fontSize: 13, color: '#a3a3a3' }}>Add items to see your breakdown.</p> : byCat.map(({ cat, n }) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <span style={{ width: 100, fontSize: 12, fontWeight: 500, color: '#0a0a0a' }}>{cat}</span>
            <div style={{ flex: 1, height: 2, background: '#f5f5f5' }}>
              <div style={{ height: '100%', background: '#0a0a0a', width: `${Math.round((n / closet.length) * 100)}%`, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ fontSize: 12, color: '#a3a3a3', minWidth: 20, textAlign: 'right' }}>{n}</span>
          </div>
        ))}
      </div>

      {styles.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 16 }}>Your Style Aesthetic</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {styles.map(s => <span key={s} style={{ padding: '5px 14px', border: '1px solid #e5e5e5', fontSize: 11, color: '#737373', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s}</span>)}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 16 }}>Color Palette</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {colors.map(c => <span key={c} style={{ padding: '5px 14px', border: '1px solid #e5e5e5', fontSize: 11, color: '#737373', letterSpacing: '0.06em' }}>{c}</span>)}
          </div>
        </div>
      )}
    </div>
  )
}
