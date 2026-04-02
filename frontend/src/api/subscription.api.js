import axios from '@/api/axios'

// Subscription pricing plans
export const SUBSCRIPTION_PLANS = [
  {
    name: 'Free Tier',
    id: 'free',
    price: 0,
    priceDisplay: 'Free',
    period: 'always',
    billingCycle: 'No credit card required',
    description: 'Get started with basic features',
    features: [
      'Up to 2 active project listings',
      'Basic analytics dashboard',
      'Email support',
      'Standard visibility in search',
      'Monthly promotion credits',
    ],
    limitations: [
      '❌ No advanced analytics',
      '❌ Limited to 2 listings',
      '❌ Standard support only',
      '❌ No API access',
    ],
    cta: 'Get Started',
    popular: false,
    badge: null,
  },
  {
    name: 'Pro Tier',
    id: 'pro',
    price: 999, // In cents ($9.99)
    priceDisplay: '$9.99',
    period: 'month',
    billingCycle: 'Billed monthly, cancel anytime',
    description: 'Best for growing developers',
    features: [
      'Unlimited project listings',
      'Advanced analytics dashboard',
      'Priority email & chat support',
      'Custom branding on listings',
      'Buyer contact information access',
      'Monthly promotion credits ($50)',
      'Profile verification badge',
      'Enhanced profile visibility',
    ],
    cta: 'Start Pro',
    popular: true,
    badge: 'POPULAR',
    savings: null,
  },
  {
    name: 'Max Tier',
    id: 'max',
    price: 4999, // In cents ($49.99)
    priceDisplay: '$49.99',
    period: 'month',
    billingCycle: 'Billed monthly, cancel anytime',
    description: 'For professional agencies & high-earners',
    features: [
      'Everything in Pro +',
      'Unlimited listings with priority placement',
      'AI-powered project matching',
      'Dedicated account manager',
      '24/7 phone & priority support',
      'Quarterly promotion credits ($300)',
      'Platinum profile badge',
      'Premium profile visibility',
      'Advanced API access',
      'Custom integration support',
      'White-label options',
      'Team management (5 members)',
    ],
    cta: 'Start Max',
    popular: false,
    badge: 'ELITE',
    savings: null,
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
export const upgradeSubscription = async (plan) => {
  try {
    const response = await axios.post('/api/subscriptions/upgrade', {
      plan,
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
            plan: plan.plan || plan,
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
    const response = await axios.get('/api/subscriptions')
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
    const response = await axios.delete('/api/subscriptions/cancel')
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

export const subscriptionAPI = {
  getSubscriptionPlans,
  upgradeSubscription,
  getSubscription,
  cancelSubscription,
}
