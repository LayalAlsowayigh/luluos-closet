'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShirtIcon, SparklesIcon, MessageSquareIcon, UserIcon, CalendarIcon } from 'lucide-react'

const NAV = [
  { href: '/wardrobe',  label: 'Wardrobe',  icon: ShirtIcon },
  { href: '/style',     label: 'Style Me',  icon: SparklesIcon },
  { href: '/calendar',  label: 'Calendar',  icon: CalendarIcon },
  { href: '/chat',      label: 'Stylist',   icon: MessageSquareIcon },
  { href: '/profile',   label: 'Profile',   icon: UserIcon },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{ width: 240, borderRight: '1px solid #e5e5e5', position: 'fixed', top: 0, left: 0, height: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
        <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid #e5e5e5' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 2 }}>Luluo&apos;s</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a' }}>Closet</p>
        </div>
        <nav style={{ flex: 1, padding: '20px 16px' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href || path.startsWith(href + '/')
            return (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 2, textDecoration: 'none', color: active ? '#0a0a0a' : '#737373', background: active ? '#f5f5f5' : 'transparent', fontSize: 13, fontWeight: active ? 600 : 400, letterSpacing: '0.02em', transition: 'all 0.15s' }}>
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '20px 28px', borderTop: '1px solid #e5e5e5' }}>
          <p style={{ fontSize: 10, color: '#d4d4d4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI-Powered Styling</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-header" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#ffffff', borderBottom: '1px solid #e5e5e5', zIndex: 50, alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a3a3a3', lineHeight: 1 }}>Luluo&apos;s</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a', lineHeight: 1 }}>Closet</p>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: '#ffffff', borderTop: '1px solid #e5e5e5', zIndex: 50, justifyContent: 'space-around', alignItems: 'center' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: active ? '#0a0a0a' : '#a3a3a3', padding: '4px 12px' }}>
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
            </Link>
          )
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
