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
      <aside
        className="desktop-sidebar"
        style={{
          width: 240,
          borderRight: '1px solid var(--border)',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          background: 'var(--sidebar-bg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50
        }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>
            Luluo&apos;s
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)' }}>
            Closet
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href || path.startsWith(href + '/')

            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  marginBottom: 4,
                  textDecoration: 'none',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--bg-tertiary)' : 'transparent',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  borderRadius: 6,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = 'var(--bg-tertiary)'
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer (optional) */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)' }} />
      </aside>

      {/* MOBILE HEADER */}
      <div
        className="mobile-header"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border)',
          zIndex: 50,
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Luluo&apos;s
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)' }}>
            Closet
          </p>
        </div>
      </div>

      {/* MOBILE NAV */}
      <nav
        className="mobile-nav"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid var(--border)',
          zIndex: 50,
          justifyContent: 'space-around',
          alignItems: 'center'
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
                color: active ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
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