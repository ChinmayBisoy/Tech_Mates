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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-100/60 px-4 py-12 dark:bg-base">
      <div className="pointer-events-none absolute left-0 top-10 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400/30 to-blue-600/20 blur-3xl dark:bg-blue-700/20" />
      <div className="pointer-events-none absolute -right-8 bottom-0 h-96 w-96 rounded-full bg-gradient-to-l from-cyan-400/30 to-blue-600/20 blur-3xl dark:bg-cyan-700/15" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/10" />

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 dark:border-blue-600/40 dark:bg-blue-900/20 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Join TechMates
          </p>
          <h1 className="mt-4 text-4xl font-extrabold bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
            Build, hire, and ship with confidence.
          </h1>
          <p className="mt-3 text-blue-700/70 dark:text-blue-200/70">
            Create your account and get access to trusted collaboration, contracts, and payouts.
          </p>
        </div>

        {!selectedRole ? (
          <div className="rounded-2xl border border-blue-300/50 bg-gradient-to-br from-white/95 to-blue-50/50 p-8 shadow-2xl shadow-blue-300/40 backdrop-blur-md dark:border-blue-700/40 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-slate-900/50 dark:shadow-blue-900/40">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 p-2 dark:from-blue-900/30 dark:to-cyan-900/30">
                <Compass className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100">What brings you here?</h2>
                <p className="text-sm text-blue-700/70 dark:text-blue-200/70">Choose your role to personalize your experience.</p>
              </div>
            </div>

            <RoleSelector value={selectedRole} onChange={setSelectedRole} />
          </div>
        ) : (
          <div className="rounded-2xl border border-blue-300/50 bg-gradient-to-br from-white/95 to-blue-50/50 p-8 shadow-2xl shadow-blue-300/40 backdrop-blur-md dark:border-blue-700/40 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-slate-900/50 dark:shadow-blue-900/40">
            <button
              onClick={() => setSelectedRole(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Change role
            </button>

            <h2 className="mb-6 text-2xl font-semibold text-blue-900 dark:text-blue-100">
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

        <p className="mt-8 text-center text-xs text-blue-600/70 dark:text-blue-300/70">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  )
}
