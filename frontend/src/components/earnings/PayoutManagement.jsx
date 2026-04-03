import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Wallet, AlertCircle, CheckCircle, Loader2, Copy, ExternalLink } from 'lucide-react'
import { earningsAPI } from '@/api/earnings.api'
import { showToast } from '@/lib/toast'

export function PayoutManagement({ releasedEarnings, kycVerified }) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    upiId: '',
  })
  const [copied, setCopied] = useState(false)

  const MIN_PAYOUT = 500 // ₹500 minimum

  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const payoutAmount = Math.floor(parseFloat(amount) * 100) // Convert to paise
      await earningsAPI.requestPayout(payoutAmount, paymentMethod, accountDetails)
    },
    onSuccess: () => {
      showToast.success('Payout request submitted! You will receive funds within 2-5 business days.')
      setAmount('')
      setAccountDetails({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        upiId: '',
      })
    },
    onError: (error) => {
      const message = error?.message || 'Failed to request payout'
      showToast.error(message)
    },
  })

  const handleRequestPayout = async () => {
    const payoutAmount = parseFloat(amount)

    if (!amount || isNaN(payoutAmount)) {
      showToast.error('Please enter a valid amount')
      return
    }

    if (payoutAmount < MIN_PAYOUT) {
      showToast.error(`Minimum payout amount is ₹${MIN_PAYOUT}`)
      return
    }

    if (payoutAmount > releasedEarnings) {
      showToast.error('Payout amount cannot exceed your available earnings')
      return
    }

    if (!kycVerified) {
      showToast.error('KYC verification is required before requesting payout')
      return
    }

    if (paymentMethod === 'bank') {
      if (!accountDetails.accountNumber || !accountDetails.ifscCode || !accountDetails.accountHolderName) {
        showToast.error('Please fill in all bank account details')
        return
      }
    } else if (paymentMethod === 'upi') {
      if (!accountDetails.upiId) {
        showToast.error('Please enter your UPI ID')
        return
      }
    }

    requestPayoutMutation.mutate()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Available Balance */}
      <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Available to Withdraw
            </p>
            <h3 className="text-4xl font-bold text-green-700 dark:text-green-300">
              ₹{releasedEarnings.toLocaleString()}
            </h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              Minimum payout: ₹{MIN_PAYOUT} • Processing time: 2-5 business days
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* KYC Check */}
      {!kycVerified && (
        <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-300">KYC Verification Required</p>
            <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-1">
              Complete your KYC verification to enable payouts
            </p>
          </div>
        </div>
      )}

      {/* Payout Amount */}
      <div className="rounded-xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Request Withdrawal</h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payout Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 dark:text-gray-400 font-semibold">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min={MIN_PAYOUT}
              max={releasedEarnings}
              className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Available: ₹{releasedEarnings.toLocaleString()} | Min: ₹{MIN_PAYOUT}
          </p>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
              { id: 'upi', label: 'UPI', icon: '📱' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === method.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-green-500'
                }`}
              >
                <span className="text-2xl mb-2 block">{method.icon}</span>
                <p className={`font-medium ${paymentMethod === method.id ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                  {method.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {paymentMethod === 'bank' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountDetails.accountHolderName}
                  onChange={(e) =>
                    setAccountDetails({ ...accountDetails, accountHolderName: e.target.value })
                  }
                  placeholder="Your full name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountDetails.accountNumber}
                  onChange={(e) =>
                    setAccountDetails({ ...accountDetails, accountNumber: e.target.value })
                  }
                  placeholder="Your bank account number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={accountDetails.ifscCode}
                  onChange={(e) =>
                    setAccountDetails({
                      ...accountDetails,
                      ifscCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., HDFC0000123"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono uppercase"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={accountDetails.upiId}
                onChange={(e) => setAccountDetails({ ...accountDetails, upiId: e.target.value })}
                placeholder="username@upi"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Request Button */}
        <button
          onClick={handleRequestPayout}
          disabled={requestPayoutMutation.isPending || !kycVerified}
          className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {requestPayoutMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Request Payout
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
          💡 Important Information
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li>• Payouts are processed every weekday</li>
          <li>• Bank transfers typically complete within 2-5 business days</li>
          <li>• Minimum payout amount: ₹{MIN_PAYOUT}</li>
          <li>• Your account details are encrypted and secure</li>
          <li>• You can track payout status in the Payout History tab</li>
        </ul>
      </div>
    </div>
  )
}
