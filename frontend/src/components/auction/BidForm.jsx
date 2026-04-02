import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

const bidSchema = z.object({
  bidAmount: z.coerce
    .number()
    .min(1, 'Bid amount must be greater than 0')
    .refine((val) => val > 0, 'Invalid bid amount'),
})

export function BidForm({ auction, currentUserBalance = 10000, onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      bidAmount: auction.currentBid + 100,
    },
  })

  const bidAmount = watch('bidAmount')
  const isValidBid = bidAmount > auction.currentBid
  const hasBalance = currentUserBalance >= bidAmount
  const incrementAmount = Math.ceil((auction.currentBid * 0.05) / 100) * 100 || 100

  const handleQuickBid = (amount) => {
    const newAmount = auction.currentBid + amount
    if (newAmount <= currentUserBalance) {
      onSubmit({ bidAmount: newAmount })
    }
  }

  return (
    <div className="bg-white dark:bg-surface rounded-xl border-2 border-blue-500 dark:border-blue-600 p-6 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Place Your Bid
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Current bid: <span className="font-bold text-primary-600 dark:text-primary-400">${auction.currentBid}</span>
        </p>
      </div>

      {/* Current Balance */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Available Balance: <span className="font-bold text-primary-600 dark:text-primary-400">${currentUserBalance}</span>
        </p>
      </div>

      {/* Bid Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Bid Amount Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">
            Your Bid
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              {...register('bidAmount')}
              placeholder={`${auction.currentBid + 100}`}
              className={cn(
                'w-full pl-10 pr-4 py-2 border-2 rounded-lg transition-all',
                'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
                'focus:outline-none focus:border-blue-500 dark:focus:border-blue-400',
                errors.bidAmount
                  ? 'border-red-500 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            />
          </div>
          {errors.bidAmount && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.bidAmount.message}
            </p>
          )}
        </div>

        {/* Bid Validation Warnings */}
        {bidAmount <= auction.currentBid && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Your bid must be higher than the current bid
            </p>
          </div>
        )}

        {!hasBalance && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Insufficient balance. You need ${bidAmount - currentUserBalance} more.
            </p>
          </div>
        )}

        {/* Bid Summary */}
        {isValidBid && hasBalance && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Current Bid</p>
                <p className="font-bold text-gray-900 dark:text-white">${auction.currentBid}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Your Bid</p>
                <p className="font-bold text-green-600 dark:text-green-400">${bidAmount}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Difference</p>
                <p className="font-bold text-primary-600 dark:text-primary-400">
                  +${bidAmount - auction.currentBid}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                <p className="font-bold text-gray-900 dark:text-white">
                  ${currentUserBalance - bidAmount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Bid Buttons */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
            Quick Bid
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickBid(amount)}
                disabled={auction.currentBid + amount > currentUserBalance}
                className={cn(
                  'py-2 rounded-lg font-semibold text-sm transition-all',
                  auction.currentBid + amount <= currentUserBalance
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                )}
              >
                +${amount}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValidBid || !hasBalance || isSubmitting}
          className={cn(
            'w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide',
            isValidBid && hasBalance && !isSubmitting
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
              : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
          )}
        >
          {isSubmitting ? '⏳ Submitting...' : '💰 Place Bid'}
        </button>
      </form>

      {/* Auction Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p>✓ Your bid is secure and held in escrow</p>
        <p>✓ You can retract before auction closes</p>
        <p>✓ Automatic payment if you win</p>
      </div>
    </div>
  )
}
