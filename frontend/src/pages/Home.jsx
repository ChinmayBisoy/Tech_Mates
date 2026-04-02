import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/shared/PageLoader'
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  Users,
  WalletCards,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Star,
  Target,
  Trophy,
  ClipboardList,
} from 'lucide-react'
import { requirementAPI } from '@/api/requirement.api'
import { getRequirementProposals } from '@/api/proposal.api'
import { getMyContracts } from '@/api/contract.api'
import { userAPI } from '@/api/user.api'
import { reviewAPI } from '@/api/review.api'

// ===== LANDING PAGE (Non-authenticated) =====
function LandingPage() {
  const trustSignals = [
    {
      icon: ShieldCheck,
      title: 'Secure Escrow',
      description: 'Funds stay protected and are released only when milestones are approved.',
    },
    {
      icon: BadgeCheck,
      title: 'Verified Reviews',
      description: 'Ratings are tied to real project activity to keep feedback honest.',
    },
    {
      icon: Zap,
      title: 'Fast Resolution',
      description: 'Escalation and dispute tools are built in when things need a decision.',
    },
  ]

  const howItWorks = [
    {
      title: 'Service Exchange Market',
      accent: 'bg-primary-600',
      steps: [
        { title: 'Post requirements', description: 'Share goals, budget, and timeline in minutes.' },
        { title: 'Receive proposals', description: 'Compare skilled developers and clear bids.' },
        { title: 'Start with confidence', description: 'Use contracts, milestones, and escrow from day one.' },
      ],
    },
    {
      title: 'Project Market',
      accent: 'bg-accent-600',
      steps: [
        { title: 'Publish your build', description: 'List templates, SaaS kits, and production-ready code.' },
        { title: 'Get discovered', description: 'Buyers browse by category, quality, and relevance.' },
        { title: 'Deliver instantly', description: 'Complete purchases with smooth digital delivery.' },
      ],
    },
  ]

  const platformHighlights = [
    {
      icon: UserRound,
      title: 'Built for Clients',
      description: 'Post requirements, review proposals, and hire with transparent budgets and milestones.',
      linkLabel: 'Learn client flow',
      linkTo: '/help',
    },
    {
      icon: Rocket,
      title: 'Built for Developers',
      description: 'Pitch projects, showcase your strengths, and grow your income through trusted contracts.',
      linkLabel: 'Explore developer journey',
      linkTo: '/help',
    },
    {
      icon: Store,
      title: 'Two Powerful Markets',
      description: 'Offer custom services in SE Market or sell ready-made products in Project Market.',
      linkLabel: 'See marketplace',
      linkTo: '/se-market',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 text-gray-900 dark:bg-none dark:bg-base dark:text-white">
      <section className="relative overflow-hidden border-b border-indigo-200/70 bg-gradient-to-b from-indigo-100 via-sky-50 to-indigo-50 dark:border-gray-800 dark:from-primary-950/25 dark:via-base dark:to-base">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-[32rem] rounded-full bg-indigo-300/55 blur-3xl dark:bg-primary-500/20" />
        <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 translate-x-1/3 rounded-full bg-cyan-200/70 blur-3xl dark:bg-accent-500/20" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-16 pt-16 sm:px-6 md:pt-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:pt-24">
          <div className="space-y-7 home-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/80 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-800 shadow-sm backdrop-blur-sm dark:border-primary-700/40 dark:bg-primary-800/25 dark:text-primary-200">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by builders and buyers
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Find your tech mate.
                <span className="mt-1 block text-transparent bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text dark:from-primary-300 dark:via-primary-200 dark:to-accent-300">
                  Build something worth sharing.
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-700 dark:text-gray-300">
                TechMates helps clients and developers ship better projects with escrow-backed trust,
                transparent collaboration, and discovery that feels effortless.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register?role=user"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/20"
              >
                Start as a client
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register?role=developer"
                className="inline-flex items-center justify-center rounded-xl border-2 border-primary-600 bg-gradient-to-r from-white to-indigo-50 px-6 py-3 font-semibold text-primary-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-50 hover:shadow-md hover:shadow-indigo-200/70 dark:border-accent-500 dark:bg-none dark:bg-base dark:text-accent dark:hover:bg-primary-900/20"
              >
                Start as a developer
              </Link>
            </div>

            <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-white/90 to-indigo-100/70 p-3 shadow-sm shadow-indigo-200/60 dark:border-gray-800 dark:bg-none dark:bg-surface/80">
                <p className="text-2xl font-bold text-primary-600 dark:text-accent">2,400+</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Developers</p>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-white/90 to-indigo-100/70 p-3 shadow-sm shadow-indigo-200/60 dark:border-gray-800 dark:bg-none dark:bg-surface/80">
                <p className="text-2xl font-bold text-primary-600 dark:text-accent">1,800+</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Projects</p>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-b from-white/90 to-indigo-100/70 p-3 shadow-sm shadow-indigo-200/60 dark:border-gray-800 dark:bg-none dark:bg-surface/80">
                <p className="text-2xl font-bold text-primary-600 dark:text-accent">₹2.4Cr+</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Paid out</p>
              </div>
            </div>
          </div>

          <div className="relative home-fade-up home-fade-up-delay">
            <div className="rounded-3xl border border-indigo-300/80 bg-gradient-to-b from-white/90 via-indigo-100 to-cyan-100/70 p-6 shadow-xl shadow-indigo-300/60 ring-1 ring-white/60 dark:border-gray-700 dark:bg-none dark:bg-surface dark:shadow-none">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">
                    Platform at a glance
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-slate-100">What you can do in under 5 minutes</h2>
                </div>
                <div className="rounded-lg bg-primary-100 p-2 dark:bg-slate-700/80">
                  <Layers3 className="h-5 w-5 text-primary-700 dark:text-white" />
                </div>
              </div>

              <div className="mb-4 space-y-2.5">
                <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-gray-700 dark:bg-base/70">
                  <div className="mt-0.5 rounded-md bg-primary-100 p-1.5 dark:bg-slate-700/75">
                    <Briefcase className="h-4 w-4 text-primary-700 dark:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">Post a requirement or publish your product</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose services, products, or both based on your goal.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-gray-700 dark:bg-base/70">
                  <div className="mt-0.5 rounded-md bg-accent-100 p-1.5 dark:bg-slate-700/75">
                    <Users className="h-4 w-4 text-accent-700 dark:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">Match with verified people</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Compare profiles, proposals, reviews, and delivery confidence.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-gray-700 dark:bg-base/70">
                  <div className="mt-0.5 rounded-md bg-success/15 p-1.5 dark:bg-slate-700/75">
                    <WalletCards className="h-4 w-4 text-success dark:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">Secure contracts and payouts</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Milestones, escrow protection, and dispute support are built in.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 dark:border-gray-700 dark:bg-base/70">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">For Clients</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-slate-100">Hire faster with less risk</p>
                </div>
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 dark:border-gray-700 dark:bg-base/70">
                  <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">For Developers</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-slate-100">Win quality work consistently</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-indigo-100/70 via-sky-50 to-slate-50 py-16 dark:bg-none dark:bg-surface/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-300 bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-800 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5" />
              Explore TechMates
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Everything you need to build and ship better</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              TechMates combines hiring, contracts, project sales, and protected payments in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {platformHighlights.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-indigo-100/70 p-6 shadow-sm shadow-indigo-100/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-none dark:bg-base"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-primary-100 p-2 dark:bg-slate-700/75">
                    <Icon className="h-5 w-5 text-primary-700 dark:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.description}</p>
                  <Link
                    to={item.linkTo}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 transition-colors group-hover:text-primary-600 dark:text-accent"
                  >
                    {item.linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-sky-50 to-indigo-100/45 py-16 dark:bg-none dark:bg-base">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Why teams feel safe building here</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Built-in trust systems keep collaboration clear from proposal to delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {trustSignals.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-indigo-100/70 p-6 shadow-sm shadow-indigo-100/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-none dark:bg-slate-800"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-primary-100 p-2 dark:bg-slate-700/80">
                    <Icon className="h-5 w-5 text-primary-700 dark:text-cyan-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-indigo-200 bg-gradient-to-b from-indigo-100/70 via-sky-50 to-slate-100/80 py-16 dark:border-gray-800 dark:bg-none dark:bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">How it works</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Two clear paths to buy services or sell finished products.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {howItWorks.map((market) => (
              <div key={market.title} className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-indigo-100/65 p-7 dark:border-gray-800 dark:bg-none dark:bg-base">
                <h3 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">{market.title}</h3>
                <ol className="space-y-4">
                  {market.steps.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${market.accent}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{step.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-indigo-50/70 to-sky-100/55 py-16 dark:bg-none dark:bg-base">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-300 bg-gradient-to-r from-indigo-100 via-white to-cyan-100 p-8 text-center shadow-xl shadow-indigo-200/60 dark:border-primary-800 dark:from-primary-950/30 dark:via-surface dark:to-accent-950/20 sm:p-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Ready to ship your next project?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
              Join TechMates and start with clarity, speed, and trust from day one.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register?role=user"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Start as a client
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register?role=developer"
                className="inline-flex items-center justify-center rounded-xl border border-primary-600 px-6 py-3 font-semibold text-primary-700 transition-colors hover:bg-primary-50 dark:text-accent dark:hover:bg-primary-900/20"
              >
                Start as a developer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// ===== CLIENT DASHBOARD HOME (Authenticated) =====
function ClientDashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch my requirements
  const { data: requirementsData = {}, isLoading: reqLoading } = useQuery({
    queryKey: ['myRequirements'],
    queryFn: () => requirementAPI.getMyRequirements(1, 10),
  })

  // Fetch contracts
  const { data: contractsData = {}, isLoading: contractLoading } = useQuery({
    queryKey: ['myContracts'],
    queryFn: () => getMyContracts(1, 10),
  })

  const requirements = Array.isArray(requirementsData) ? requirementsData : requirementsData.items || []
  const contracts = Array.isArray(contractsData) ? contractsData : contractsData.items || []

  // Fetch proposals for first 3 requirements
  const { data: proposalsData = {}, isLoading: propLoading } = useQuery({
    queryKey: ['receivedProposals', requirements.map(r => r._id)],
    queryFn: async () => {
      if (!requirements.length) return []
      const proposals = await Promise.all(
        requirements.slice(0, 3).map(req => getRequirementProposals(req._id, 1, 5))
      )
      return proposals.flat()
    },
    enabled: Boolean(requirements.length),
  })

  const proposals = Array.isArray(proposalsData) ? proposalsData : Array.isArray(proposalsData.items) ? proposalsData.items : []

  if (reqLoading || contractLoading) {
    return <PageLoader />
  }

  const activeProposals = proposals.filter(p => p.status === 'pending').length
  const activeContracts = contracts.filter(c => c.status === 'active').length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-base dark:to-surface py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            You have {activeProposals} new proposals and {activeContracts} active contracts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-white to-indigo-50 p-6 shadow-sm dark:border-gray-700 dark:bg-surface/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{requirements.length}</p>
              </div>
              <div className="rounded-lg bg-primary-100 p-3 dark:bg-slate-700/80">
                <Briefcase className="h-6 w-6 text-primary-600 dark:text-cyan-300" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-accent-200 bg-gradient-to-br from-white to-accent-50 p-6 shadow-sm dark:border-gray-700 dark:bg-surface/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">₹{(requirements.reduce((sum, r) => sum + (r.budget || 0), 0) / 1000).toFixed(0)}k</p>
              </div>
              <div className="rounded-lg bg-accent-100 p-3 dark:bg-slate-700/80">
                <WalletCards className="h-6 w-6 text-accent-600 dark:text-accent-300" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-success/30 bg-gradient-to-br from-white to-green-50 p-6 shadow-sm dark:border-gray-700 dark:bg-surface/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proposals Got</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{proposals.length}</p>
              </div>
              <div className="rounded-lg bg-success/15 p-3 dark:bg-slate-700/80">
                <TrendingUp className="h-6 w-6 text-success dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 shadow-sm dark:border-gray-700 dark:bg-surface/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Milestones</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{activeContracts}</p>
              </div>
              <div className="rounded-lg bg-amber-100 p-3 dark:bg-slate-700/80">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <button
              onClick={() => navigate('/se-market/post-requirement')}
              className="rounded-xl border-2 border-primary-600 bg-white px-6 py-3 font-semibold text-primary-600 transition-all hover:bg-primary-50 dark:border-accent-500 dark:bg-surface dark:text-accent dark:hover:bg-slate-700"
            >
              + Post Requirement
            </button>
            <button
              onClick={() => navigate('/browse/developers')}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-surface dark:text-gray-300 dark:hover:bg-slate-700"
            >
              Browse Developers
            </button>
            <button
              onClick={() => navigate('/se-market/my-requirements')}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-surface dark:text-gray-300 dark:hover:bg-slate-700"
            >
              My Requirements
            </button>
            <button
              onClick={() => navigate('/dashboard/purchases')}
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-surface dark:text-gray-300 dark:hover:bg-slate-700"
            >
              My Purchases
            </button>
          </div>
        </div>

        {/* Your Active Requirements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Active Requirements</h2>
            <Link
              to="/se-market/my-requirements"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {requirements.slice(0, 3).map((req) => (
              <div
                key={req._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-surface/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{req.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{req.description?.substring(0, 100)}...</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <span className="text-gray-700 dark:text-gray-300">Budget:</span>
                        <span className="text-primary-600 dark:text-accent">₹{(req.budget / 1000).toFixed(0)}k</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <span className="text-gray-700 dark:text-gray-300">Status:</span>
                        <span className="text-success">{req.status}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{req.proposals?.length || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Proposals</p>
                  </div>
                </div>
              </div>
            ))}
            {!requirements.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-surface/50">
                <p className="text-gray-600 dark:text-gray-400">No active requirements yet</p>
                <button
                  onClick={() => navigate('/se-market/post-requirement')}
                  className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent"
                >
                  Post your first requirement →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Proposals Received */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Proposals Received</h2>
            <Link
              to="/se-market/proposals-received"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {proposals.slice(0, 3).map((proposal) => (
              <div
                key={proposal._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-surface/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{proposal.developerId?.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{proposal.coverLetter?.substring(0, 100)}...</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <span className="text-gray-700 dark:text-gray-300">Bid:</span>
                        <span className="text-primary-600 dark:text-accent font-bold">₹{(proposal.proposedPrice / 1000).toFixed(0)}k</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium">
                        <span className="text-gray-700 dark:text-gray-300">Delivery:</span>
                        <span>{proposal.deliveryDays} days</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {proposal.status === 'pending' && (
                      <button
                        onClick={() => navigate(`/proposal/${proposal._id}`)}
                        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors dark:bg-accent dark:hover:bg-accent/90"
                      >
                        Review
                      </button>
                    )}
                    {proposal.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1 text-sm text-success font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Accepted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!proposals.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-surface/50">
                <p className="text-gray-600 dark:text-gray-400">No proposals yet. Post a requirement to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Active Contracts Status */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Contracts Status</h2>
            <Link
              to="/contracts"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {contracts.slice(0, 3).map((contract) => (
              <div
                key={contract._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-surface/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contract.requirementId?.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">with {contract.developerId?.name}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {Math.round((contract.milestones?.filter(m => m.status === 'approved').length || 0) / (contract.milestones?.length || 1) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full bg-primary-600 dark:bg-accent transition-all"
                          style={{
                            width: `${Math.round((contract.milestones?.filter(m => m.status === 'approved').length || 0) / (contract.milestones?.length || 1) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: contract.status === 'active' ? '#dcfce7' : '#fef3c7',
                        color: contract.status === 'active' ? '#15803d' : '#92400e',
                      }}
                    >
                      {contract.status === 'active' ? (
                        <>
                          <div className="h-2 w-2 rounded-full bg-current" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4" />
                          {contract.status}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!contracts.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-surface/50">
                <p className="text-gray-600 dark:text-gray-400">No active contracts yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== DEVELOPER DASHBOARD HOME =====
function DeveloperDashboardHome() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch dashboard stats
  const { data: dashboardData } = useQuery({
    queryKey: ['developer-dashboard'],
    queryFn: userAPI.getDashboard,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch active contracts
  const { data: contractsData = { data: [] } } = useQuery({
    queryKey: ['my-contracts', 1],
    queryFn: () => getMyContracts(1, 4),
    staleTime: 60 * 1000,
  })
  const contracts = contractsData.data || []

  // Fetch matching opportunities (open requirements)
  const { data: opportunitiesData = { data: [] } } = useQuery({
    queryKey: ['open-requirements', 1],
    queryFn: () => requirementAPI.fetchRequirements({ status: 'open' }, 1, 6),
    staleTime: 60 * 1000,
  })
  const opportunities = opportunitiesData.data || []

  // Fetch recent reviews/feedback
  const { data: reviewsData = { data: [] } } = useQuery({
    queryKey: ['my-reviews', user?._id, 1],
    queryFn: () => reviewAPI.getUserReviews(user?._id, 1, 3),
    staleTime: 5 * 60 * 1000,
    enabled: !!user?._id,
  })
  const reviews = reviewsData.data || []

  const stats = [
    {
      label: 'Available Earnings',
      value: (dashboardData?.availableEarnings || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    },
    {
      label: 'Pending Earnings',
      value: (dashboardData?.pendingEarnings || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }),
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    },
    {
      label: 'This Month',
      value: (dashboardData?.thisMonthEarnings || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    },
    {
      label: 'Rating',
      value: user?.avgRating ? user.avgRating.toFixed(1) : '0',
      icon: Star,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
      suffix: user?.avgRating ? `(${(dashboardData?.totalReviews || 0)} reviews)` : 'No reviews yet',
    },
  ]

  const quickActions = [
    {
      label: 'Browse Requirements',
      icon: Target,
      onClick: () => navigate('/se-market'),
    },
    {
      label: 'Submit Proposal',
      icon: Briefcase,
      onClick: () => navigate('/se-market?action=explore'),
    },
    {
      label: 'View My Proposals',
      icon: ClipboardList,
      onClick: () => navigate('/dashboard/proposals'),
    },
    {
      label: 'Request Payout',
      icon: Rocket,
      onClick: () => navigate('/dashboard/wallet'),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's your development dashboard at a glance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  {stat.suffix && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">{stat.suffix}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => {
              const Icon = action.icon
              return (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className="flex items-center justify-center gap-3 rounded-xl bg-white dark:bg-surface border border-gray-300 dark:border-gray-600 px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md"
                >
                  <Icon className="w-5 h-5" />
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Contracts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Contracts</h2>
            <Link
              to="/dashboard/contracts"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-surface/80"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {contract.requirementTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Client: {contract.clientName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600 dark:text-accent">
                      ₹{(contract.totalAmount / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {contract.status}
                    </p>
                  </div>
                </div>

                {/* Milestones Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {contract.completedMilestones}/{contract.totalMilestones} milestones
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-accent rounded-full h-2 transition-all"
                      style={{
                        width: `${Math.round((contract.completedMilestones / contract.totalMilestones) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {!contracts.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-surface/50">
                <Briefcase className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-3">No active contracts yet</p>
                <button
                  onClick={() => navigate('/se-market')}
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
                >
                  Browse opportunities →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Matching Opportunities */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Matching Opportunities</h2>
            <Link
              to="/se-market"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.slice(0, 3).map((opportunity) => (
              <div
                key={opportunity._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-surface/80 cursor-pointer hover:border-primary-300 dark:hover:border-accent/50"
                onClick={() => navigate(`/se-market/requirement/${opportunity._id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex-1">
                    {opportunity.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full whitespace-nowrap">
                    <Target className="w-3 h-3" />
                    {opportunity.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {opportunity.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                    <p className="text-lg font-bold text-primary-600 dark:text-accent">
                      ₹{(opportunity.budget / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Proposals</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {opportunity.proposalCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {!opportunities.length && (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-surface/50">
                <Target className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-3">No matching opportunities right now</p>
                <button
                  onClick={() => navigate('/se-market')}
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
                >
                  Browse all requirements →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Feedback</h2>
            <Link
              to="/dashboard/reviews"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-accent dark:hover:text-accent/80 font-semibold"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-surface/80"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{review.reviewerName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      on {new Date(review.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              </div>
            ))}

            {!reviews.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-surface/50">
                <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No reviews yet. Complete your first contract to get feedback!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== MAIN HOME COMPONENT =====
export function Home() {
  const { isAuthenticated, user, hasHydrated } = useAuth()

  if (!hasHydrated) {
    return <PageLoader />
  }

  // Show personalized dashboard for authenticated clients
  if (isAuthenticated && user?.role === 'client') {
    return <ClientDashboardHome />
  }

  // Show personalized dashboard for authenticated developers
  if (isAuthenticated && user?.role === 'developer') {
    return <DeveloperDashboardHome />
  }

  // Show landing page for non-authenticated or non-client/developer users
  return <LandingPage />
}
