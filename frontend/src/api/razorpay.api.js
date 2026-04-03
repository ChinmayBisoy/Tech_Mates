import axios from '@/api/axios'

/**
 * Create Razorpay order for milestone payment
 */
export const createRazorpayOrder = async (contractId, milestoneId, amount) => {
  try {
    const response = await axios.post('/payments/razorpay/create-order', {
      contractId,
      milestoneId,
      amount,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Verify Razorpay payment
 */
export const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  try {
    const response = await axios.post('/payments/razorpay/verify', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Create Razorpay order for subscription
 */
export const createSubscriptionOrder = async (planId, amount) => {
  try {
    const response = await axios.post('/payments/razorpay/subscription', {
      planId,
      amount,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Create Razorpay order for payout
 */
export const createPayoutOrder = async (amount) => {
  try {
    const response = await axios.post('/payments/razorpay/payout', {
      amount,
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

/**
 * Initialize Razorpay payment on frontend
 * @param {object} options - Razorpay payment options
 */
export const initiateRazorpayPayment = (options) => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded'))
      return
    }

    const rzp = new window.Razorpay({
      ...options,
      handler(response) {
        resolve(response)
      },
      modal: {
        ondismiss() {
          reject(new Error('Payment cancelled'))
        },
      },
    })

    rzp.open()
  })
}

export const razorpayAPI = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createSubscriptionOrder,
  createPayoutOrder,
  initiateRazorpayPayment,
}
