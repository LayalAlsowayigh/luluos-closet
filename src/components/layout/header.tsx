import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export async function Header() {
  const { userId } = await auth()
  if (!userId) return null

  return (
    <header style={{ height: 60, borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 48px', background: '#ffffff', position: 'sticky', top: 0, zIndex: 40 }}>
      <UserButton afterSignOutUrl="/" />
    </header>
  )
}
