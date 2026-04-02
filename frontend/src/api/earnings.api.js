import axios from '@/api/axios'

// Get detailed earnings analytics
export const getEarningsAnalytics = async (period = 'month') => {
  try {
    const response = await axios.get('/payments/earnings/analytics', {
      params: { period },
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Get earnings breakdown by project
export const getEarningsByProject = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get('/payments/earnings/by-project', {
      params: { page, limit },
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Get earnings breakdown by client
export const getEarningsByClient = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get('/payments/earnings/by-client', {
      params: { page, limit },
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Get earnings breakdown by skill
export const getEarningsBySkill = async () => {
  try {
    const response = await axios.get('/payments/earnings/by-skill')
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Request payout
export const requestPayout = async (amount, paymentMethod, accountDetails) => {
  try {
    const response = await axios.post('/payments/payout', {
      amount,
      paymentMethod,
      accountDetails,
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Get payout history
export const getPayoutHistory = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get('/payments/payouts', {
      params: { page, limit },
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Generate tax report
export const generateTaxReport = async (year) => {
  try {
    const response = await axios.get('/payments/tax-report', {
      params: { year },
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Export earnings data (CSV/PDF)
export const exportEarningsData = async (format = 'csv', startDate, endDate) => {
  try {
    const response = await axios.get('/payments/earnings/export', {
      params: { format, startDate, endDate },
      responseType: format === 'pdf' ? 'blob' : 'json',
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Get forecast based on pending projects
export const getEarningsForecast = async () => {
  try {
    const response = await axios.get('/payments/earnings/forecast')
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Get performance metrics
export const getPerformanceMetrics = async () => {
  try {
    const response = await axios.get('/payments/earnings/metrics')
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Withdraw funds
export const withdrawFunds = async (amount, bankAccount, accountHolder) => {
  try {
    const response = await axios.post('/wallet/withdraw', {
      amount,
      bankAccount,
      accountHolder,
    })
    return response.data.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const earningsAPI = {
  getEarningsAnalytics,
  getEarningsByProject,
  getEarningsByClient,
  getEarningsBySkill,
  requestPayout,
  getPayoutHistory,
  generateTaxReport,
  exportEarningsData,
  getEarningsForecast,
  getPerformanceMetrics,
  withdrawFunds,
}
