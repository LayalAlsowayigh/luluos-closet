import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/wardrobe')

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', fontFamily: 'inherit' }}>
      {/* Left: Brand panel */}
      <div style={{ background: '#0a0a0a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '52px 56px' }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#525252', marginBottom: 6 }}>Luluo&apos;s</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 52, fontWeight: 300, color: '#ffffff', lineHeight: 1, fontStyle: 'italic' }}>Closet</h1>
        </div>
        <div>
          <div style={{ width: 40, height: 1, background: '#262626', marginBottom: 32 }} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 300, color: '#ffffff', lineHeight: 1.5, fontStyle: 'italic', marginBottom: 40 }}>
            &ldquo;Your wardrobe,<br />curated by intelligence.&rdquo;
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
            {['Photo Wardrobe', 'AI Bg Removal', 'Outfit Generator', 'Virtual Try-On', 'Style Chat', 'Look History'].map(f => (
              <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 3, height: 3, background: '#525252', borderRadius: '50%' }} />
                <span style={{ fontSize: 11, color: '#525252', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '52px 72px', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', marginBottom: 12 }}>
            Get Started
          </h2>
          <p style={{ fontSize: 14, color: '#737373', marginBottom: 40, lineHeight: 1.7 }}>
            Build your digital wardrobe and let AI style you for every occasion.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/sign-up" style={{ display: 'block', padding: '14px 32px', background: '#0a0a0a', color: '#ffffff', textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
              Create Account
            </Link>
            <Link href="/sign-in" style={{ display: 'block', padding: '13px 32px', border: '1.5px solid #e5e5e5', color: '#0a0a0a', textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
