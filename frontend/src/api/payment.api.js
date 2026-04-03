import instance from './axios';

const paymentApi = {
  // Transaction 1: Fund milestone (Client → Developer via Escrow)
  fundMilestone: async (contractId, milestoneId) => {
    const response = await instance.post('/payments/fund-milestone', {
      contractId,
      milestoneId,
    });
    return response.data;
  },

  // Release milestone payment (Client approves)
  releaseMilestone: async (contractId, milestoneId) => {
    const response = await instance.post('/payments/release-milestone', {
      contractId,
      milestoneId,
    });
    return response.data;
  },

  // Refund milestone (Admin)
  refundMilestone: async (contractId, milestoneId) => {
    const response = await instance.post('/payments/refund-milestone', {
      contractId,
      milestoneId,
    });
    return response.data;
  },

  // Verify milestone payment (after Stripe confirms)
  verifyMilestonePayment: async (transactionId) => {
    const response = await instance.post('/payments/verify-milestone', {
      transactionId,
    });
    return response.data;
  },

  // Get developer earnings
  getEarnings: async (page = 1, limit = 10) => {
    const response = await instance.get('/payments/earnings', {
      params: { page, limit },
    });
    return response.data;
  },

  // Transaction 2: Withdrawal (Developer → Bank)
  initiateWithdrawal: async (amount, accountType, accountDetails) => {
    const response = await instance.post('/payments/withdrawal/initiate', {
      amount,
      accountType,
      accountDetails,
    });
    return response.data;
  },

  // Get withdrawal history
  getWithdrawalHistory: async (page = 1, limit = 10) => {
    const response = await instance.get('/payments/withdrawal/history', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get transaction history
  getTransactionHistory: async (page = 1, limit = 10, type) => {
    const response = await instance.get('/payments/transactions/history', {
      params: { page, limit, type },
    });
    return response.data;
  },

  // Request payout (legacy)
  requestPayout: async (amount) => {
    const response = await instance.post('/payments/payout', { amount });
    return response.data;
  },

  // Admin endpoints
  processWithdrawal: async (withdrawalId, transactionId) => {
    const response = await instance.post(
      `/payments/admin/withdrawal/${withdrawalId}/process`,
      { transactionId }
    );
    return response.data;
  },

  cancelWithdrawal: async (withdrawalId, reason) => {
    const response = await instance.post(
      `/payments/admin/withdrawal/${withdrawalId}/cancel`,
      { reason }
    );
    return response.data;
  },
};

export default paymentApi;
