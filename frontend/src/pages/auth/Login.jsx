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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-100/60 px-4 py-12 dark:bg-base">
      <div className="pointer-events-none absolute -left-24 top-8 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400/30 to-blue-600/20 blur-3xl dark:bg-blue-700/20" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-gradient-to-l from-cyan-400/30 to-blue-600/20 blur-3xl dark:bg-cyan-700/15" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/10" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        <div className="hidden rounded-3xl border border-blue-300/60 ring-1 ring-white/60 bg-gradient-to-br from-white/72 via-blue-50/75 to-indigo-100/55 p-8 shadow-2xl shadow-blue-400/30 dark:border-blue-700/50 dark:ring-blue-900/40 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-indigo-900/20 dark:shadow-blue-900/40 lg:block backdrop-blur-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-300/60 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 dark:border-blue-600/40 dark:bg-blue-900/20 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome Back
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight bg-gradient-to-r from-blue-950 to-blue-700 dark:from-blue-200 dark:to-cyan-200 bg-clip-text text-transparent">
            Pick up where your last project left off.
          </h1>
          <p className="mt-4 max-w-md text-blue-900/80 dark:text-blue-100/85">
            Sign in to manage proposals, contracts, milestones, and payouts from one clean workspace.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-blue-300/55 bg-white/55 px-4 py-3 dark:border-blue-700/45 dark:bg-blue-900/20">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              <span className="text-sm text-blue-950/85 dark:text-blue-100">Escrow-protected milestones for safer delivery</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-blue-300/55 bg-white/55 px-4 py-3 dark:border-blue-700/45 dark:bg-blue-900/20">
              <TimerReset className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              <span className="text-sm text-blue-950/85 dark:text-blue-100">Track progress and updates in real time</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md justify-self-center">
          <div className="mb-6 text-center">
            <p className="inline-flex items-center gap-1 rounded-full border border-blue-300/60 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 dark:border-blue-600/40 dark:bg-blue-900/20 dark:text-blue-300">
              Account Login
            </p>
            <h2 className="mt-4 text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-300 dark:to-cyan-300 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <p className="mt-2 text-blue-700/70 dark:text-blue-200/70">
              Sign in to your TechMates account
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/50 bg-gradient-to-br from-white/95 to-blue-50/50 p-8 shadow-2xl shadow-blue-300/40 backdrop-blur-md dark:border-blue-700/40 dark:bg-gradient-to-br dark:from-blue-950/40 dark:to-slate-900/50 dark:shadow-blue-900/40">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>

          <p className="mt-6 text-center text-xs text-blue-600/70 dark:text-blue-300/70">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mx-auto mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Back to homepage
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
