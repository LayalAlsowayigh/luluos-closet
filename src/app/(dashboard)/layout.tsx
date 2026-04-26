import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Sidebar />
      <div className="main-content" style={{ marginLeft: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '40px 48px' }}>
          {children}
        </main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
          .main-content main {
            padding: 72px 16px 80px !important;
          }
        }
      `}</style>
    </div>
  )
}
