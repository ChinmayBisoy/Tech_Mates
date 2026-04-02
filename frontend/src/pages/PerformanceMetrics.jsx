import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  Award,
  Clock,
  Star,
  Users,
  Target,
  Zap,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { earningsAPI } from '@/api/earnings.api'
import { useNavigate } from 'react-router-dom'

function MetricCard({ icon: Icon, label, value, unit, change, highlight }) {
  const isPositiveChange = change > 0

  return (
    <div className={`rounded-xl border p-6 ${
      highlight
        ? 'bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800'
        : 'bg-white dark:bg-surface border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          highlight
            ? 'bg-accent-500'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}>
          <Icon className={`w-6 h-6 ${
            highlight ? 'text-white' : 'text-gray-600 dark:text-gray-400'
          }`} />
        </div>
        {change !== undefined && (
          <span className={`text-sm font-semibold flex items-center gap-1 ${
            isPositiveChange
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositiveChange ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {unit && (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

function RankingCard({ rank, label, value, badge }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 font-bold text-sm">
          #{rank}
        </div>
        <div>
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          {badge && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {badge}
            </p>
          )}
        </div>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  )
}

function ProgressBar({ label, value, max, color }) {
  const percentage = (value / max) * 100

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {value} / {max}
        </p>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default function PerformanceMetrics() {
  const { user, isDeveloper } = useAuth()
  const navigate = useNavigate()

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => earningsAPI.getPerformanceMetrics(),
    enabled: !!user && isDeveloper,
  })

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-700 dark:text-yellow-400">
              Performance Metrics - Developers Only
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    )
  }

  const data = metrics || {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/earnings')}
          className="mb-6 text-accent-500 hover:text-accent-600 font-medium text-sm flex items-center gap-1"
        >
          ← Back to Earnings
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Performance Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your key performance indicators and rankings
          </p>
        </div>

        {/* Tier Badge */}
        {data.tier && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8" />
              <div>
                <h2 className="text-lg font-bold">{data.tier} Developer</h2>
                <p className="text-accent-100">
                  Top performer among {data.tierPercentile}% of developers
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-accent-100 text-sm">Next Tier</p>
                <p className="text-2xl font-bold mt-1">
                  {data.nextTierEarnings?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-accent-100 text-sm">Tier Progress</p>
                <p className="text-2xl font-bold mt-1">
                  {data.tierProgress || 0}%
                </p>
              </div>
              <div>
                <p className="text-accent-100 text-sm">Months Active</p>
                <p className="text-2xl font-bold mt-1">
                  {data.monthsActive || 0}
                </p>
              </div>
              <div>
                <p className="text-accent-100 text-sm">Badge Count</p>
                <p className="text-2xl font-bold mt-1">
                  {data.badges?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={TrendingUp}
            label="Average Hourly Rate"
            value={`₹${(data.avgHourlyRate || 0).toLocaleString()}`}
            change={data.rateChange}
            highlight={true}
          />
          <MetricCard
            icon={Clock}
            label="Total Hours Worked"
            value={data.totalHours || 0}
            unit="hours"
            change={data.hoursChange}
          />
          <MetricCard
            icon={Users}
            label="Total Projects"
            value={data.totalProjects || 0}
            change={data.projectsChange}
          />
          <MetricCard
            icon={Star}
            label="Average Rating"
            value={data.avgRating || 0}
            unit="/5.0"
            change={data.ratingChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Zap}
            label="Repeat Client Rate"
            value={`${(data.repeatClientRate || 0).toFixed(1)}%`}
          />
          <MetricCard
            icon={Target}
            label="Completion Rate"
            value={`${(data.completionRate || 0).toFixed(1)}%`}
          />
          <MetricCard
            icon={Award}
            label="Current Streak"
            value={data.currentStreak || 0}
            unit="projects"
          />
        </div>

        {/* Detailed Sections */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Skills */}
          <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-500" />
              Top Skills
            </h3>

            <div className="space-y-3">
              {(data.topSkills || []).map((skill, idx) => (
                <RankingCard
                  key={idx}
                  rank={idx + 1}
                  label={skill.name}
                  value={`₹${(skill.avgRate || 0).toLocaleString()}/hr`}
                  badge={`${skill.projects} projects`}
                />
              ))}
            </div>

            {(!data.topSkills || data.topSkills.length === 0) && (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No skill data available yet
              </p>
            )}
          </div>

          {/* Badges & Achievements */}
          <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-500" />
              Achievements
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {(data.badges || []).map((badge, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 text-center"
                >
                  <p className="text-2xl mb-1">{badge.icon}</p>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                    {badge.name}
                  </p>
                </div>
              ))}

              {(!data.badges || data.badges.length === 0) && (
                <p className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  Unlock badges by completing projects and maintaining high ratings
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Goals & Targets */}
        <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-500" />
            Monthly Goals
          </h3>

          <div className="space-y-6">
            <ProgressBar
              label="Earnings Goal"
              value={data.earningsThisMonth || 0}
              max={data.earningsGoal || 100000}
              color="bg-green-500"
            />
            <ProgressBar
              label="Project Target"
              value={data.projectsThisMonth || 0}
              max={data.projectGoal || 5}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Hours Target"
              value={data.hoursThisMonth || 0}
              max={data.hoursGoal || 160}
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Performance Tips */}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
            💡 Performance Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
            <li>• Maintain response time under 2 hours to get faster matches</li>
            <li>• Increase your rates gradually - clients respect premium expertise</li>
            <li>• Specialized skills command higher rates than generalist work</li>
            <li>• Complete projects ahead of schedule for bonus reputation</li>
            <li>• Request referrals from satisfied clients to boost repeat rates</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
