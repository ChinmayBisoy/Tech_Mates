import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { DisputeCard } from '@/components/dispute/DisputeCard'
import { DisputeTimeline } from '@/components/dispute/DisputeTimeline'
import { useDisputeStore } from '@/store/disputeStore'
import { cn } from '@/utils/cn'

export default function Disputes() {
  const { getDisputes, getDisputesByStatus, getDisputeStats } = useDisputeStore()
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedDispute, setSelectedDispute] = useState(null)

  let disputes = getDisputes()

  if (filterStatus !== 'all') {
    disputes = disputes.filter((d) => d.status === filterStatus)
  }

  if (filterPriority !== 'all') {
    disputes = disputes.filter((d) => d.priority === filterPriority)
  }

  const stats = getDisputeStats()
  const selectedDisputeData = selectedDispute ? getDisputes().find((d) => d.id === selectedDispute) : null

  const handleViewDetails = (disputeId) => {
    setSelectedDispute(disputeId)
  }

  const handleAddEvidence = (disputeId) => {
    console.log('Add evidence for dispute:', disputeId)
  }

  const handleMessage = (disputeId) => {
    console.log('Message for dispute:', disputeId)
  }

  // Priority colors
  const priorityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-blue-600 dark:text-blue-400',
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Dispute Resolution Center</h1>
          </div>
          <p className="text-red-100 text-lg">
            Manage disputes, submit evidence, and resolve conflicts fairly
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Disputes</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.total}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Open</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.open}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Under Review</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.underReview}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Resolved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.resolved}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Refunded</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">${stats.totalRefunded}</p>
          </div>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Disputes List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="space-y-3">
              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'open', 'under-review', 'resolved', 'closed'].map((status) => {
                  const count =
                    status === 'all'
                      ? disputes.length
                      : status === 'under-review'
                        ? stats.underReview
                        : stats[status]
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        'px-4 py-2 rounded-lg font-semibold transition-all text-sm',
                        filterStatus === status
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      )}
                    >
                      {status === 'all' ? '📋' : status === 'under-review' ? '🔍' : status === 'open' ? '🔴' : status === 'resolved' ? '✅' : '📁'}{' '}
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                    </button>
                  )
                })}
              </div>

              {/* Priority Filter */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={cn(
                      'px-4 py-2 rounded-lg font-semibold transition-all text-sm',
                      filterPriority === priority
                        ? priority === 'high'
                          ? 'bg-red-600 text-white'
                          : priority === 'medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    )}
                  >
                    {priority === 'all' ? '🎯' : priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'}{' '}
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Disputes Grid */}
            {disputes.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-6xl mb-4">🕊️</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No disputes found
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Try adjusting your filters'
                    : 'All disputes have been resolved! Great work.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {disputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.id}
                    dispute={dispute}
                    onViewDetails={handleViewDetails}
                    onAddEvidence={handleAddEvidence}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Selected Dispute Details */}
          <div className="lg:col-span-1">
            {selectedDisputeData ? (
              <div className="bg-white dark:bg-surface border-2 border-red-500 dark:border-red-600 rounded-lg p-4 sticky top-4 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                      {selectedDisputeData.title}
                    </h3>
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-bold text-white',
                        selectedDisputeData.priority === 'high'
                          ? 'bg-red-600'
                          : selectedDisputeData.priority === 'medium'
                            ? 'bg-yellow-600'
                            : 'bg-blue-600'
                      )}
                    >
                      {selectedDisputeData.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">ID: {selectedDisputeData.id}</p>
                </div>

                {/* Quick Info */}
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedDisputeData.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Claim Amount:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      ${selectedDisputeData.amount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Reduction:</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {selectedDisputeData.claimReduction}%
                    </span>
                  </div>
                </div>

                {/* Parties */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400">PARTIES</p>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-lg">{selectedDisputeData.claimant.avatar}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Claimant</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {selectedDisputeData.claimant.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-lg">{selectedDisputeData.respondent.avatar}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Respondent</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {selectedDisputeData.respondent.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evidence & Messages */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-center border border-orange-200 dark:border-orange-800">
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">Evidence</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {selectedDisputeData.evidence?.length || 0}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Messages</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {selectedDisputeData.messages?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Timeline Preview */}
                {(selectedDisputeData.messages?.length > 0 ||
                  selectedDisputeData.evidence?.length > 0) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                      ACTIVITY ({(selectedDisputeData.messages?.length || 0) + (selectedDisputeData.evidence?.length || 0)})
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {[
                        ...(selectedDisputeData.messages || []),
                        ...(selectedDisputeData.evidence || []),
                      ]
                        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                        .slice(-3)
                        .reverse()
                        .map((item, idx) => (
                          <div key={idx} className="text-xs p-1 bg-gray-50 dark:bg-gray-800 rounded">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {item.sender || item.submittedBy}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 truncate">
                              {item.content}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedDispute(null)}
                  className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close Details
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center sticky top-4">
                <div className="text-4xl mb-2">👈</div>
                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                  Select a dispute to view full details and timeline
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
