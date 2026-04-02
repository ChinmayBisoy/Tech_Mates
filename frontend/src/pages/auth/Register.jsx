import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function Register() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = searchParams.get('role') || null
  const [selectedRole, setSelectedRole] = useState(initialRole)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleRegisterSuccess = () => {
    navigate('/profile/setup')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white px-4 py-12 dark:bg-base">
      <div className="pointer-events-none absolute left-0 top-10 h-64 w-64 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-700/20" />
      <div className="pointer-events-none absolute -right-8 bottom-0 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl dark:bg-accent-700/20" />

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-700 dark:border-primary-700/40 dark:bg-primary-900/20 dark:text-primary-300">
            <Sparkles className="h-3.5 w-3.5" />
            Join TechMates
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-white">
            Build, hire, and ship with confidence.
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Create your account and get access to trusted collaboration, contracts, and payouts.
          </p>
        </div>

        {!selectedRole ? (
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-xl shadow-primary-100/60 backdrop-blur-sm dark:border-gray-700 dark:bg-surface/95 dark:shadow-none">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-2 dark:bg-primary-900/30">
                <Compass className="h-5 w-5 text-primary-700 dark:text-primary-200" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">What brings you here?</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your role to personalize your experience.</p>
              </div>
            </div>

            <RoleSelector value={selectedRole} onChange={setSelectedRole} />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-xl shadow-primary-100/60 backdrop-blur-sm dark:border-gray-700 dark:bg-surface/95 dark:shadow-none">
            <button
              onClick={() => setSelectedRole(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-accent dark:hover:text-accent-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Change role
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
              {selectedRole === 'user'
                ? 'Create your client account'
                : 'Create your developer account'}
            </h2>

            <RegisterForm
              role={selectedRole}
              onSuccess={handleRegisterSuccess}
            />
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-600 dark:text-gray-400">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  )
}
