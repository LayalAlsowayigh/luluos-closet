import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: 4 }}>Luluo&apos;s</p>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 300, fontStyle: 'italic', color: '#0a0a0a' }}>Closet</p>
      </div>
      <SignIn routing="hash" />
    </div>
  )
}