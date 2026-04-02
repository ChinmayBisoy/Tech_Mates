import { cn } from '@/utils/cn'

export function MilestoneTracker({ milestones, totalProgress }) {
  const completedCount = milestones?.filter((m) => m.status === 'completed').length || 0

  const getMilestoneDisplay = (milestone, index) => {
    const statusColors = {
      completed: 'bg-green-600',
      'in-progress': 'bg-blue-600',
      pending: 'bg-gray-300',
    }

    return (
      <div key={milestone.id} className="flex flex-col items-center">
        {/* Milestone Dot */}
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center font-bold text-white border-2 transition-all',
            statusColors[milestone.status],
            'border-white dark:border-surface shadow-md'
          )}
        >
          {milestone.status === 'completed' ? '✓' : index + 1}
        </div>

        {/* Milestone Label */}
        <div className="mt-3 text-center min-w-24">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-2">
            {milestone.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            {milestone.percentage}%
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Total Progress</h3>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalProgress}%</span>
        </div>
        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {completedCount} of {milestones?.length || 0} milestones completed
        </p>
      </div>

      {/* Milestone Timeline */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Milestone Timeline</h3>

        {/* Visual Timeline */}
        <div className="flex items-start justify-between mb-8 px-2">
          {milestones?.map((milestone, index) => (
            <div key={milestone.id} className="flex-1 relative">
              {/* Connection Line */}
              {index < milestones.length - 1 && (
                <div
                  className={cn(
                    'absolute top-6 left-1/2 right-0 h-1 -translate-y-1/2',
                    milestone.status === 'completed'
                      ? 'bg-green-500'
                      : milestone.status === 'in-progress'
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                  )}
                />
              )}

              {/* Milestone Item */}
              <div className="flex justify-center relative z-10">
                {getMilestoneDisplay(milestone, index)}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Milestone List */}
        <div className="space-y-3 mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          {milestones?.map((milestone, index) => (
            <div
              key={milestone.id}
              className={cn(
                'p-3 rounded-lg flex items-center gap-3 transition-all',
                milestone.status === 'completed'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : milestone.status === 'in-progress'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              )}
            >
              {/* Status Icon */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold',
                  milestone.status === 'completed'
                    ? 'bg-green-600'
                    : milestone.status === 'in-progress'
                      ? 'bg-blue-600'
                      : 'bg-gray-400'
                )}
              >
                {milestone.status === 'completed' ? '✓' : index + 1}
              </div>

              {/* Milestone Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {milestone.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {milestone.percentage}% • ${milestone.amount}
                  {milestone.status === 'in-progress' &&
                    ` • ${milestone.progressPercentage || 0}% Complete`}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={cn(
                  'px-2 py-1 rounded text-xs font-bold uppercase',
                  milestone.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : milestone.status === 'in-progress'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-400 text-white'
                )}
              >
                {milestone.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Completed</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{completedCount}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">In Progress</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {milestones?.filter((m) => m.status === 'in-progress').length || 0}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Pending</p>
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {milestones?.filter((m) => m.status === 'pending').length || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
