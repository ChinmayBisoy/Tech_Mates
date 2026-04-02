import instance from './axios'

export const walletAPI = {
  // Get wallet balance for current user
  getBalance: async () => {
    const response = await instance.get('/wallet/balance')
    return response.data
  },

  // Get wallet details including transaction history
  getWalletDetails: async (page = 1, limit = 20) => {
    const response = await instance.get('/wallet/details', {
      params: { page, limit },
    })
    return response.data
  },

  // Get transaction history
  getTransactionHistory: async (page = 1, limit = 20, type = null) => {
    const response = await instance.get('/wallet/transactions', {
      params: { page, limit, ...(type && { type }) },
    })
    return response.data
  },

  // Get single transaction details
  getTransactionDetail: async (transactionId) => {
    const response = await instance.get(`/wallet/transactions/${transactionId}`)
    return response.data
  },

  // Add funds to wallet
  addFunds: async (amount, paymentMethod) => {
    const response = await instance.post('/wallet/add-funds', {
      amount,
      paymentMethod,
    })
    return response.data
  },

  // Withdraw funds from wallet
  withdrawFunds: async (amount, withdrawalMethod) => {
    const response = await instance.post('/wallet/withdraw', {
      amount,
      withdrawalMethod,
    })
    return response.data
  },

  // Get withdrawal history
  getWithdrawalHistory: async (page = 1, limit = 20) => {
    const response = await instance.get('/wallet/withdrawals', {
      params: { page, limit },
    })
    return response.data
  },

  // Cancel pending withdrawal
  cancelWithdrawal: async (withdrawalId) => {
    const response = await instance.post(
      `/wallet/withdrawals/${withdrawalId}/cancel`
    )
    return response.data
  },

  // Get wallet analytics (earnings, spending, etc.)
  getAnalytics: async (period = 'month') => {
    const response = await instance.get('/wallet/analytics', {
      params: { period },
    })
    return response.data
  },

  // Transfer funds to another user (if applicable)
  transferFunds: async (recipientId, amount, description) => {
    const response = await instance.post('/wallet/transfer', {
      recipientId,
      amount,
      description,
    })
    return response.data
  },

  // Get developer earnings
  getEarnings: async (page = 1, limit = 20) => {
    const response = await instance.get('/payments/earnings', {
      params: { page, limit },
    })
    return response.data
  },
}
