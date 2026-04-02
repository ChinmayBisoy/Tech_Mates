import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles, TimerReset } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'

export function Login() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLoginSuccess = () => {
    navigate('/dashboard')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white px-4 py-12 dark:bg-base">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-700/20" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl dark:bg-accent-700/20" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        <div className="hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white via-primary-50/60 to-accent-50/40 p-8 shadow-xl shadow-primary-100/60 dark:border-gray-700 dark:from-surface dark:via-base dark:to-base dark:shadow-none lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-700 dark:border-primary-700/40 dark:bg-primary-900/20 dark:text-primary-300">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome Back
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 dark:text-white">
            Pick up where your last project left off.
          </h1>
          <p className="mt-4 max-w-md text-gray-600 dark:text-gray-300">
            Sign in to manage proposals, contracts, milestones, and payouts from one clean workspace.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/80 px-4 py-3 dark:border-gray-700 dark:bg-base/70">
              <ShieldCheck className="h-4 w-4 text-primary-600 dark:text-accent" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Escrow-protected milestones for safer delivery</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white/80 px-4 py-3 dark:border-gray-700 dark:bg-base/70">
              <TimerReset className="h-4 w-4 text-primary-600 dark:text-accent" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Track progress and updates in real time</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center">
          <div className="mb-6 text-center">
            <p className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-gray-700 dark:border-gray-700 dark:bg-surface dark:text-gray-300">
              Account Login
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to your TechMates account
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-xl shadow-primary-100/60 backdrop-blur-sm dark:border-gray-700 dark:bg-surface/95 dark:shadow-none">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>

          <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mx-auto mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition-colors hover:text-primary-600 dark:text-accent"
          >
            Back to homepage
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
