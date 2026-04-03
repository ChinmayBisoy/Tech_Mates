import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'

/**
 * Load Razorpay Script
 * Call this once in your app layout or main component
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Hook to load Razorpay script
 */
export const useRazorpayScript = () => {
  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        console.error('Failed to load Razorpay script')
      }
    })
  }, [])
}

/**
 * Razorpay Payment Component
 * Handles payment flow for milestone payments
 */
export function RazorpayPaymentButton({ orderId, amount, email, onSuccess, onError, isLoading }) {
  const handlePayment = async () => {
    if (!window.Razorpay) {
      showToast.error('Razorpay SDK not loaded. Please refresh and try again.')
      return
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: orderId,
      amount: amount,
      currency: 'INR',
      email: email,
      name: 'Tech-Mates',
      description: 'Milestone Payment',
      handler: function (response) {
        onSuccess(response)
      },
      prefill: {
        email: email,
      },
      theme: {
        color: '#3B82F6',
      },
      modal: {
        ondismiss: function () {
          onError(new Error('Payment cancelled'))
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          Pay Now ₹{(amount / 100).toLocaleString()}
        </>
      )}
    </button>
  )
}

export default RazorpayPaymentButton
