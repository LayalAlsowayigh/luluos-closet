'use client'
import { UserButton } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header
      style={{
        height: 64,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 48px',
        background: 'var(--sidebar-bg)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle dark mode"
            style={{
              width: 44,
              height: 24,
              background: theme === 'dark'
                ? 'var(--text-primary)'
                : 'var(--bg-tertiary)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s',
              flexShrink: 0
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: theme === 'dark'
                  ? 'var(--bg)'
                  : 'var(--text-primary)',
                position: 'absolute',
                top: 3,
                left: theme === 'dark' ? 23 : 3,
                transition: 'left 0.3s'
              }}
            />
          </button>
        )}

        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}