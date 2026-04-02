import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  ArrowRight,
  Calendar,
  DollarSign,
  Clock,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { walletAPI } from '@/api/wallet.api'
import { earningsAPI } from '@/api/earnings.api'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { showToast } from '@/lib/toast'

// Validation Schema
const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is ₹100').positive('Amount must be positive'),
  paymentMethod: z.enum(['bank_transfer', 'upi']),
  accountHolder: z.string().min(3, 'Account holder name required').max(100),
  bankAccount: z.string().optional().refine(
    (val) => !val || /^\d{9,18}$/.test(val),
    'Invalid bank account number'
  ),
  ifscCode: z.string().optional().refine(
    (val) => !val || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val),
    'Invalid IFSC code'
  ),
  upiId: z.string().optional().refine(
    (val) => !val || /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(val),
    'Invalid UPI ID'
  ),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'bank_transfer') {
    if (!data.bankAccount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bankAccount'],
        message: 'Bank account required for bank transfer',
      })
    }
    if (!data.ifscCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ifscCode'],
        message: 'IFSC code required for bank transfer',
      })
    }
  }
  if (data.paymentMethod === 'upi') {
    if (!data.upiId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['upiId'],
        message: 'UPI ID required for UPI transfer',
      })
    }
  }
})

// Helper Components
function WithdrawalHistory() {
  const { data: payoutHistory, isLoading } = useQuery({
    queryKey: ['payout-history'],
    queryFn: () => earningsAPI.getPayoutHistory(1, 10),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
      </div>
    )
  }

  const payouts = payoutHistory?.items || []

  return (
    <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-accent-500" />
        Withdrawal History
      </h3>

      {payouts.length > 0 ? (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <div
              key={payout._id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  ₹{payout.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(payout.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    payout.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : payout.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {payout.status === 'completed' && (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {payout.status === 'pending' && (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {payout.paymentMethod.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-gray-500 dark:text-gray-400">
          No withdrawal requests yet
        </p>
      )}
    </div>
  )
}

function SavedPaymentMethods() {
  return (
    <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-accent-500" />
        Saved Payment Methods
      </h3>

      <div className="space-y-3">
        <div className="p-4 rounded-lg border-2 border-accent-500 bg-accent-50 dark:bg-accent-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Bank Transfer</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ICICI Bank - XXXX XXXX XXXX 1234
              </p>
            </div>
            <span className="inline-flex px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-400 text-xs font-medium">
              Default
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">UPI</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                user@upi
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </div>

      <button className="w-full mt-4 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-white font-medium transition-colors">
        + Add Payment Method
      </button>
    </div>
  )
}

function WithdrawalForm({ availableBalance, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const methods = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'bank_transfer',
      accountHolder: '',
    },
  })

  const { register, handleSubmit, watch, formState: { errors }, reset } = methods
  const paymentMethod = watch('paymentMethod')

  const requestWithdrawalMutation = useMutation({
    mutationFn: (data) =>
      earningsAPI.requestPayout(data.amount, data.paymentMethod, {
        accountHolder: data.accountHolder,
        bankAccount: data.bankAccount,
        ifscCode: data.ifscCode,
        upiId: data.upiId,
      }),
    onSuccess: () => {
      alert('Withdrawal request submitted successfully!')
      reset()
      onSuccess?.()
    },
    onError: (error) => {
      alert(error?.response?.data?.message || 'Failed to process withdrawal')
    },
  })

  const onSubmit = (data) => {
    requestWithdrawalMutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Withdrawal Amount *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            ₹
          </span>
          <input
            type="number"
            step="100"
            {...register('amount', { valueAsNumber: true })}
            placeholder="Enter amount (minimum ₹100)"
            className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-colors"
          />
        </div>
        {errors.amount && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-2">
            {errors.amount.message}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Available: ₹{availableBalance?.toLocaleString()}
        </p>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Payment Method *
        </label>
        <div className="space-y-2">
          {[
            { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
            { value: 'upi', label: 'UPI', icon: DollarSign },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <input
                type="radio"
                value={value}
                {...register('paymentMethod')}
                className="w-4 h-4 text-accent-500 focus:ring-accent-500"
              />
              <span className="ml-3 text-gray-900 dark:text-white font-medium">
                {label}
              </span>
            </label>
          ))}
        </div>
        {errors.paymentMethod && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-2">
            {errors.paymentMethod.message}
          </p>
        )}
      </div>

      {/* Account Holder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Account Holder Name *
        </label>
        <input
          type="text"
          {...register('accountHolder')}
          placeholder="Full name as per bank record"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-colors"
        />
        {errors.accountHolder && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-2">
            {errors.accountHolder.message}
          </p>
        )}
      </div>

      {/* Bank Transfer Fields */}
      {paymentMethod === 'bank_transfer' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bank Account Number *
            </label>
            <input
              type="text"
              {...register('bankAccount')}
              placeholder="E.g., 1234567890123456"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-colors"
            />
            {errors.bankAccount && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-2">
                {errors.bankAccount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              IFSC Code *
            </label>
            <input
              type="text"
              {...register('ifscCode')}
              placeholder="E.g., ICIC0000001"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-colors uppercase"
            />
            {errors.ifscCode && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-2">
                {errors.ifscCode.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* UPI Fields */}
      {paymentMethod === 'upi' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            UPI ID *
          </label>
          <input
            type="email"
            {...register('upiId')}
            placeholder="E.g., user@upi"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-colors"
          />
          {errors.upiId && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-2">
              {errors.upiId.message}
            </p>
          )}
        </div>
      )}

      {/* T&C */}
      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <p className="text-xs text-yellow-800 dark:text-yellow-300">
          ✓ Processing time: 3-5 business days<br />
          ✓ Minimum withdrawal: ₹100<br />
          ✓ Maximum withdrawal: ₹5,00,000 per request
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={requestWithdrawalMutation.isPending}
        className="w-full py-3 px-4 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {requestWithdrawalMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ArrowRight className="w-4 h-4" />
            Request Withdrawal
          </>
        )}
      </button>
    </form>
  )
}

// Main Component
export default function WithdrawPage() {
  const { user, isDeveloper } = useAuth()
  const navigate = useNavigate()
  const [successMessage, setSuccessMessage] = useState('')

  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['earnings-summary', user?._id],
    queryFn: () => walletAPI.getEarnings(1, 1),
    enabled: !!user && isDeveloper,
  })

  if (!isDeveloper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-700 dark:text-yellow-400">
              Only developers can request withdrawals
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

  const availableBalance = earningsData?.data?.releasedEarnings || 0
  const pendingBalance = earningsData?.data?.pendingEarnings || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-base dark:via-surface dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/earnings')}
          className="mb-6 text-accent-500 hover:text-accent-600 font-medium text-sm flex items-center gap-1"
        >
          ← Back to Earnings
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Request Withdrawal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Transfer your released earnings to your bank account or digital wallet
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Balance Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Available Balance
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              ₹{availableBalance.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-3 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Ready for withdrawal
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Balance
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              ₹{pendingBalance.toLocaleString()}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-3 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Awaiting milestone approval
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Withdrawal Details
            </h2>

            <WithdrawalForm
              availableBalance={availableBalance}
              onSuccess={() => setSuccessMessage('Withdrawal request submitted successfully!')}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SavedPaymentMethods />
            <WithdrawalHistory />
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
            ❓ Common Questions
          </h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer font-medium text-blue-900 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400">
                <span className="group-open:rotate-90 inline-block transition-transform">
                  ▶
                </span>
                How long does withdrawal take?
              </summary>
              <p className="mt-2 ml-6 text-sm text-blue-800 dark:text-blue-400">
                Most withdrawals are processed within 3-5 business days. Bank holidays may delay transfers.
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer font-medium text-blue-900 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400">
                <span className="group-open:rotate-90 inline-block transition-transform">
                  ▶
                </span>
                What's the minimum withdrawal amount?
              </summary>
              <p className="mt-2 ml-6 text-sm text-blue-800 dark:text-blue-400">
                The minimum withdrawal amount is ₹100. Maximum per request is ₹5,00,000.
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer font-medium text-blue-900 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400">
                <span className="group-open:rotate-90 inline-block transition-transform">
                  ▶
                </span>
                Are there any withdrawal fees?
              </summary>
              <p className="mt-2 ml-6 text-sm text-blue-800 dark:text-blue-400">
                Bank transfers are fee-free. UPI transfers may have nominal charges depending on your bank.
              </p>
            </details>

            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer font-medium text-blue-900 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400">
                <span className="group-open:rotate-90 inline-block transition-transform">
                  ▶
                </span>
                Can I cancel a withdrawal request?
              </summary>
              <p className="mt-2 ml-6 text-sm text-blue-800 dark:text-blue-400">
                Withdrawal requests can be cancelled within 2 hours of submission. After that, they cannot be modified.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
