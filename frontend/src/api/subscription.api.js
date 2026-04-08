import axios from '@/api/axios'

// Subscription pricing plans in Indian Rupees (INR)
export const SUBSCRIPTION_PLANS = [
  {
    name: 'Free',
    id: 'free',
    price: 0,
    priceDisplay: '₹0',
    priceNumber: 0,
    period: 'always',
    billingCycle: 'No credit card required',
    description: 'Perfect for getting started',
    features: [
      'Up to 2 active project listings',
      'Basic analytics dashboard',
      'Email support',
      'Standard visibility in search',
    ],
    limitations: [
      '❌ No advanced analytics',
      '❌ Limited to 2 listings',
      '❌ Standard support only',
      '❌ No priority features',
    ],
    cta: 'Current Plan',
    popular: false,
    badge: null,
    color: 'gray',
  },
  {
    name: 'Pro',
    id: 'pro',
    price: 83900, // In paise (₹839 = 83900 paise)
    priceDisplay: '₹839',
    priceNumber: 839,
    period: 'month',
    billingCycle: 'Billed monthly, cancel anytime',
    description: 'Best for growing developers',
    features: [
      'Unlimited project listings',
      'Advanced analytics dashboard',
      'Priority email & chat support',
      'Custom branding on listings',
      'Buyer contact information access',
      'Monthly promotion credits (₹500)',
      'Profile verification badge',
      'Enhanced profile visibility',
      'Monthly webinars & resources',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    badge: 'POPULAR',
    color: 'blue',
    savings: '10% off annual',
  },
  {
    name: 'Max',
    id: 'max',
    price: 414500, // In paise (₹4,145 = 414500 paise)
    priceDisplay: '₹4,145',
    priceNumber: 4145,
    period: 'month',
    billingCycle: 'Billed monthly, cancel anytime',
    description: 'For professionals & agencies',
    features: [
      'Everything in Pro +',
      'Unlimited listings with priority placement',
      'AI-powered project matching',
      'Dedicated account manager',
      '24/7 priority phone support',
      'Quarterly promotion credits (₹3,000)',
      'Platinum profile badge',
      'Premium profile visibility',
      'Advanced API access',
      'Custom integration support',
      'White-label profile options',
      'Team management (up to 5 members)',
      'Monthly consulting hour',
    ],
    cta: 'Upgrade to Max',
    popular: false,
    badge: 'ELITE',
    color: 'purple',
    savings: '15% off annual',
  },
]

// Get subscription plans
export const getSubscriptionPlans = async () => {
  try {
    return SUBSCRIPTION_PLANS
  } catch (error) {
    throw error
  }
}

// Create subscription (upgrade to pro)
export const upgradeSubscription = async (planId) => {
  try {
    const response = await axios.post('/subscriptions/upgrade', {
      planId,
    })
    return response.data.data
  } catch (error) {
    // If backend route doesn't exist yet, use mock data
    if (error.response?.status === 404) {
      console.warn('Backend subscription endpoint not ready, using mock data')
      // Simulate successful subscription
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Subscription upgraded successfully (mock)',
            planId: planId,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
        }, 1500) // Simulate network delay
      })
    }
    throw error.response?.data || error
  }
}

// Get current subscription
export const getSubscription = async () => {
  try {
    const response = await axios.get('/subscriptions')
    return response.data.data
  } catch (error) {
    // 404 is expected if user has no subscription
    if (error.response?.status === 404) {
      return null
    }
    throw error.response?.data || error
  }
}

// Cancel subscription
export const cancelSubscription = async () => {
  try {
    const response = await axios.delete('/subscriptions/cancel')
    return response.data.data
  } catch (error) {
    // If backend not ready, simulate mock cancellation
    if (error.response?.status === 404) {
      console.warn('Backend subscription endpoint not ready, using mock data')
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Subscription cancelled successfully (mock)',
            status: 'cancelled',
          })
        }, 1000)
      })
    }
    throw error.response?.data || error
  }
}

// Get Razorpay hosted checkout - DEPRECATED
export const getHostedCheckout = async (planId, amount, planName, email, name) => {
  throw new Error('Razorpay integration has been removed. Use upgradeSubscription instead.')
}

export const subscriptionAPI = {
  getSubscriptionPlans,
  upgradeSubscription,
  getSubscription,
  cancelSubscription,
  getHostedCheckout,
}
