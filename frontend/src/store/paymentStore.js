import { create } from 'zustand';

export const usePaymentStore = create((set) => ({
  // Wallet information
  wallet: {
    id: 'WALLET_001',
    balance: 2450.75,
    currency: 'USD',
    lastUpdated: new Date(),
    status: 'active',
  },

  // Payment methods
  paymentMethods: [
    {
      id: 'card_1',
      type: 'credit_card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      cardholderName: 'John Doe',
      isDefault: true,
    },
    {
      id: 'card_2',
      type: 'credit_card',
      brand: 'Mastercard',
      last4: '5555',
      expiryMonth: 6,
      expiryYear: 2026,
      cardholderName: 'John Doe',
      isDefault: false,
    },
    {
      id: 'bank_1',
      type: 'bank_account',
      accountName: 'John Doe Checking',
      last4: '6789',
      bankName: 'Chase Bank',
      isDefault: false,
    },
  ],

  // Transactions
  transactions: [
    {
      id: 'TXN_001',
      type: 'withdrawal',
      amount: 500,
      status: 'completed',
      date: new Date(Date.now() - 86400000),
      description: 'Withdrawal to bank account',
      reference: 'ABI-2025-001',
    },
    {
      id: 'TXN_002',
      type: 'deposit',
      amount: 1000,
      status: 'completed',
      date: new Date(Date.now() - 259200000),
      description: 'Escrow release from auction',
      reference: 'ESC-2025-456',
    },
    {
      id: 'TXN_003',
      type: 'payment',
      amount: 275.50,
      status: 'completed',
      date: new Date(Date.now() - 432000000),
      description: 'Bid on Vintage Camera',
      reference: 'AUC-2025-789',
    },
    {
      id: 'TXN_004',
      type: 'refund',
      amount: 50,
      status: 'completed',
      date: new Date(Date.now() - 604800000),
      description: 'Refund - Dispute resolution',
      reference: 'DISP-2025-123',
    },
    {
      id: 'TXN_005',
      type: 'fee',
      amount: 25.25,
      status: 'completed',
      date: new Date(Date.now() - 777600000),
      description: 'Platform fee',
      reference: 'FEE-2025-001',
    },
  ],

  // Current checkout/order
  currentOrder: null,

  // Actions
  updateBalance: (amount) => {
    set((state) => ({
      wallet: {
        ...state.wallet,
        balance: state.wallet.balance + amount,
        lastUpdated: new Date(),
      },
    }));
  },

  setBalance: (amount) => {
    set((state) => ({
      wallet: {
        ...state.wallet,
        balance: amount,
        lastUpdated: new Date(),
      },
    }));
  },

  addPaymentMethod: (method) => {
    set((state) => ({
      paymentMethods: [
        ...state.paymentMethods,
        {
          id: `${method.type}_${state.paymentMethods.length + 1}`,
          ...method,
          isDefault: state.paymentMethods.length === 0,
        },
      ],
    }));
  },

  removePaymentMethod: (methodId) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.filter(m => m.id !== methodId),
    }));
  },

  setDefaultPaymentMethod: (methodId) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === methodId,
      })),
    }));
  },

  addTransaction: (transaction) => {
    set((state) => ({
      transactions: [
        {
          id: `TXN_${Date.now()}`,
          timestamp: new Date(),
          ...transaction,
        },
        ...state.transactions,
      ].slice(0, 100), // Keep only 100 most recent
    }));
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },

  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },

  processPayment: (amount, methodId) => {
    set((state) => ({
      wallet: {
        ...state.wallet,
        balance: state.wallet.balance - amount,
        lastUpdated: new Date(),
      },
      transactions: [
        {
          id: `TXN_${Date.now()}`,
          type: 'payment',
          amount,
          status: 'completed',
          date: new Date(),
          description: 'Payment processed',
          reference: `PAY-${Date.now()}`,
        },
        ...state.transactions,
      ],
      currentOrder: null,
    }));
  },

  getTransactionsByType: (type) => {
    return (state) => state.transactions.filter(t => t.type === type);
  },

  getTransactionsByStatus: (status) => {
    return (state) => state.transactions.filter(t => t.status === status);
  },

  getRecentTransactions: (days = 30) => {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return (state) => state.transactions.filter(t => new Date(t.date) > cutoffDate);
  },

  getTotalSpent: () => {
    return (state) =>
      state.transactions
        .filter(t => (t.type === 'payment' || t.type === 'fee') && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalEarned: () => {
    return (state) =>
      state.transactions
        .filter(t => (t.type === 'deposit' || t.type === 'refund') && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
  },
}));
