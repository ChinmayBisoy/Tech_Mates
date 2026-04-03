import { useQuery } from '@tanstack/react-query'
import { Loader2, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react'
import { earningsAPI } from '@/api/earnings.api'

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Processing' },
  completed: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Failed' },
}

export function PayoutHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['payout-history'],
    queryFn: () => earningsAPI.getPayoutHistory(),
  })

  const payouts = data?.payouts || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (payouts.length === 0) {
    return (
      <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4 opacity-50" />
        <p className="text-gray-600 dark:text-gray-400">No payout history yet</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Request your first payout to see it here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Payouts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{payouts.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {payouts.filter((p) => p.status === 'completed').length}
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Processing</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {payouts.filter((p) => p.status === 'processing' || p.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Payout List */}
      <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {payouts.map((payout) => {
                const statusInfo = statusConfig[payout.status] || statusConfig.pending
                const StatusIcon = statusInfo.icon

                return (
                  <tr key={payout._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{payout.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {payout.paymentMethod === 'bank' ? 'Bank Transfer' : 'UPI'}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600 dark:text-gray-400">
                      {payout.referenceId || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          📋 Payout Status Guide
        </p>
        <div className="grid md:grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-400">
          <div>
            <p className="font-semibold mb-1">Pending</p>
            <p>Request received, awaiting processing</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Processing</p>
            <p>Your payout is being transferred</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Completed</p>
            <p>Successfully received in your account</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Failed</p>
            <p>Contact support for assistance</p>
          </div>
        </div>
      </div>
    </div>
  )
}
