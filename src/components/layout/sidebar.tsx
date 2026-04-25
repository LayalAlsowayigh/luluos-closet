'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShirtIcon, SparklesIcon, MessageSquareIcon, UserIcon } from 'lucide-react'

const NAV = [
  { href: '/wardrobe', label: 'Wardrobe',   icon: ShirtIcon },
  { href: '/style',    label: 'Style Me',   icon: SparklesIcon },
  { href: '/chat',     label: 'Stylist',    icon: MessageSquareIcon },
  { href: '/profile',  label: 'Profile',    icon: UserIcon },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{ width: 240, borderRight: '1px solid #e5e5e5', position: 'fixed', top: 0, left: 0, height: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
      {/* Logo */}
      <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid #e5e5e5' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 2 }}>Luluo&apos;s</p>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a' }}>Closet</p>
      </div>

      {/* Nav */}
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

      {/* Bottom */}
      <div style={{ padding: '20px 28px', borderTop: '1px solid #e5e5e5' }}>
        <p style={{ fontSize: 10, color: '#d4d4d4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI-Powered Styling</p>
      </div>
    </aside>
  )
}
