import { MilestoneItem } from './MilestoneItem';
import { AlertCircle } from 'lucide-react';

export function MilestoneTimeline({ 
  milestones, 
  onAction = null,
  userRole = 'viewer',
  status = 'active'
}) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-600 dark:bg-gray-800">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
        <p className="font-semibold text-gray-700 dark:text-gray-300">No milestones created</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Milestones will be added once the contract is created
        </p>
      </div>
    );
  }

  // Calculate completion percentage
  const completedMilestones = milestones.filter(
    (m) => ['approved', 'released'].includes(m.status)
  ).length;
  const completionPercentage = Math.round((completedMilestones / milestones.length) * 100);

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white">Contract Progress</h3>
          <span className="text-sm font-semibold text-primary dark:text-accent">
            {completedMilestones} of {milestones.length} completed
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 dark:from-accent dark:to-primary/80"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {completionPercentage}% of contract completed
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            index={index}
            total={milestones.length}
            isLast={index === milestones.length - 1}
            onAction={onAction}
            userRole={userRole}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Value</p>
            <p className="mt-1 font-bold text-gray-900 dark:text-white">
              ₹{(milestones.reduce((sum, m) => sum + m.amount, 0) / 100).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Completed Value</p>
            <p className="mt-1 font-bold text-green-600 dark:text-green-400">
              ₹{(milestones
                .filter((m) => ['approved', 'released'].includes(m.status))
                .reduce((sum, m) => sum + m.amount, 0) / 100).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pending Value</p>
            <p className="mt-1 font-bold text-orange-600 dark:text-orange-400">
              ₹{(milestones
                .filter((m) => !['approved', 'released'].includes(m.status))
                .reduce((sum, m) => sum + m.amount, 0) / 100).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
