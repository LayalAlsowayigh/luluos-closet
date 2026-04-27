'use client'
import { useUser } from '@clerk/nextjs'
import { useCloset } from '@/hooks/use-closet'
import { useOutfits } from '@/hooks/use-outfits'
import { CATEGORIES } from '@/lib/constants'

export function ProfileClient() {
  const { user } = useUser()
  const { closet } = useCloset()
  const { history } = useOutfits()

  const byCat = CATEGORIES
    .map(c => ({ cat: c, n: closet.filter(i => i.category === c).length }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n)

  const colors = [...new Set(closet.map(i => i.color))]
  const styles = [...new Set(closet.map(i => i.style).filter(Boolean))]

  return (
    <div style={{ maxWidth: 680, color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', paddingBottom: 40, borderBottom: '1px solid var(--border)', marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, color: 'var(--bg)', fontStyle: 'italic' }}>
              {user?.firstName?.[0] || 'U'}
            </span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 4 }}>
            {user?.fullName || user?.emailAddresses[0]?.emailAddress}
          </h1>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            {user?.emailAddresses[0]?.emailAddress}
          </p>

          <div style={{ display: 'flex', gap: 32 }}>
            {[{ v: closet.length, l: 'Items' }, { v: byCat.length, l: 'Categories' }, { v: history.length, l: 'Outfits' }].map(({ v, l }) => (
              <div key={l}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, color: 'var(--text-primary)' }}>{v}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 20 }}>
          Wardrobe Breakdown
        </h2>

        {byCat.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add items to see your breakdown.</p>
        ) : (
          byCat.map(({ cat, n }) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <span style={{ width: 100, fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{cat}</span>

              <div style={{ flex: 1, height: 2, background: 'var(--bg-tertiary)' }}>
                <div style={{ height: '100%', background: 'var(--text-primary)', width: `${Math.round((n / closet.length) * 100)}%`, transition: 'width 0.6s ease' }} />
              </div>

              <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 20, textAlign: 'right' }}>{n}</span>
            </div>
          ))
        )}
      </div>

      {styles.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 16 }}>
            Your Style Aesthetic
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {styles.map(s => (
              <span key={s} style={{ padding: '5px 14px', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', marginBottom: 16 }}>
            Color Palette
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {colors.map(c => (
              <span key={c} style={{ padding: '5px 14px', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}