import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { CollapsibleNavbar } from '@/components/shared/CollapsibleNavbar'
import FloatingHelpButton from '@/components/shared/FloatingHelpButton'
import { useThemeStore } from '@/store/themeStore'
import { useSocket } from '@/hooks/useSocket'

export default function App() {
  const { isAuthenticated } = useAuth()
  const initTheme = useThemeStore((state) => state.initTheme)
  useSocket()

  // Initialize theme from localStorage on app load
  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#111827',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '16px',
          },
          success: {
            duration: 3000,
            style: {
              background: '#d1fae5',
              color: '#065f46',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#d1fae5',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#fee2e2',
              color: '#7f1d1d',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fee2e2',
            },
          },
          loading: {
            style: {
              background: '#eff6ff',
              color: '#1e40af',
            },
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#eff6ff',
            },
          },
        }}
      />
      <div className="bg-white dark:bg-base text-gray-900 dark:text-white min-h-screen flex flex-col">
        <CollapsibleNavbar />
        <FloatingHelpButton />
      </div>
    </>
  )
}
