import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useDisputeStore = create(
  subscribeWithSelector((set, get) => ({
    disputes: [
      {
        id: 'D001',
        escrowId: 'E001',
        transactionId: 'TXN001',
        title: 'Incomplete deliverables',
        description: 'The delivered code does not match the agreed specifications',
        category: 'quality_issue',
        status: 'open', // open, under-review, resolved, closed
        priority: 'high',
        claimant: {
          name: 'Acme Corp',
          avatar: '🏢',
          role: 'buyer',
        },
        respondent: {
          name: 'John Developer',
          avatar: '👨‍💻',
          role: 'seller',
        },
        amount: 1500,
        claimReduction: 30, // percentage
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        evidence: [
          {
            id: 'EV001',
            type: 'message',
            content: 'The frontend components are missing validation logic',
            submittedBy: 'Acme Corp',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'EV002',
            type: 'screenshot',
            content: 'Screenshot showing missing error handling',
            submittedBy: 'Acme Corp',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        messages: [
          {
            id: 'MSG001',
            sender: 'Acme Corp',
            content: 'We received the code but it is missing several agreed features',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'MSG002',
            sender: 'John Developer',
            content: 'Those features are in milestone 2, not milestone 1',
            timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        arbitrator: null,
        resolution: null,
        refundAmount: 0,
      },
      {
        id: 'D002',
        escrowId: 'E002',
        transactionId: 'TXN002',
        title: 'Delayed delivery',
        description: 'Project was not delivered within the agreed timeline',
        category: 'missed_deadline',
        status: 'resolved',
        priority: 'medium',
        claimant: {
          name: 'StartUp Inc',
          avatar: '🚀',
          role: 'buyer',
        },
        respondent: {
          name: 'Sarah Mobile Dev',
          avatar: '👩‍💼',
          role: 'seller',
        },
        amount: 1000,
        claimReduction: 15,
        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        evidence: [
          {
            id: 'EV003',
            type: 'document',
            content: 'Original contract with delivery date: 2026-03-15',
            submittedBy: 'StartUp Inc',
            timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        messages: [
          {
            id: 'MSG003',
            sender: 'StartUp Inc',
            content: 'The project deadline was missed by 5 days',
            timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        arbitrator: {
          name: 'Admin-Arbitrator-1',
          avatar: '⚖️',
        },
        resolution: {
          decision: 'partial_refund',
          amount: 500,
          reason: 'Partial compensation for late delivery due to external factors',
          decidedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        refundAmount: 500,
      },
      {
        id: 'D003',
        escrowId: 'E003',
        transactionId: 'TXN003',
        title: 'Communication issues',
        description: 'Seller not responding to messages and updates',
        category: 'communication_issue',
        status: 'under-review',
        priority: 'medium',
        claimant: {
          name: 'Creative Brand',
          avatar: '🎨',
          role: 'buyer',
        },
        respondent: {
          name: 'Lisa Designer',
          avatar: '👩‍🎨',
          role: 'seller',
        },
        amount: 500,
        claimReduction: 20,
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        evidence: [
          {
            id: 'EV004',
            type: 'message_log',
            content: 'No response for 7 days - message history attached',
            submittedBy: 'Creative Brand',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        messages: [
          {
            id: 'MSG004',
            sender: 'Creative Brand',
            content: 'We have been trying to reach you for updates',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        arbitrator: null,
        resolution: null,
        refundAmount: 0,
      },
    ],

    disputeCategories: [
      { id: 'quality_issue', label: 'Quality Issue', icon: '⚠️' },
      { id: 'missed_deadline', label: 'Missed Deadline', icon: '⏰' },
      { id: 'communication_issue', label: 'Communication Issue', icon: '💬' },
      { id: 'scope_change', label: 'Scope Change', icon: '📝' },
      { id: 'payment_issue', label: 'Payment Issue', icon: '💰' },
      { id: 'unauthorized_work', label: 'Unauthorized Work', icon: '🚫' },
      { id: 'other', label: 'Other', icon: '❓' },
    ],

    // Get all disputes
    getDisputes: () => get().disputes,

    // Get dispute by ID
    getDisputeById: (id) => get().disputes.find((d) => d.id === id),

    // Get disputes for user (as claimant or respondent)
    getUserDisputes: (userName) => {
      return get().disputes.filter(
        (d) => d.claimant.name === userName || d.respondent.name === userName
      )
    },

    // Get disputes by status
    getDisputesByStatus: (status) => {
      return get().disputes.filter((d) => d.status === status)
    },

    // Create new dispute
    createDispute: (disputeData) => {
      const newDispute = {
        ...disputeData,
        id: `D${Date.now()}`,
        status: 'open',
        evidence: [],
        messages: [],
        arbitrator: null,
        resolution: null,
        refundAmount: 0,
        createdDate: new Date().toISOString(),
      }
      set((state) => ({
        disputes: [...state.disputes, newDispute],
      }))
      return newDispute.id
    },

    // Add evidence to dispute
    addEvidence: (disputeId, evidence) => {
      set((state) => ({
        disputes: state.disputes.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                evidence: [
                  ...d.evidence,
                  {
                    ...evidence,
                    id: `EV${Date.now()}`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : d
        ),
      }))
    },

    // Add message to dispute
    addMessage: (disputeId, message) => {
      set((state) => ({
        disputes: state.disputes.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                messages: [
                  ...d.messages,
                  {
                    ...message,
                    id: `MSG${Date.now()}`,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : d
        ),
      }))
    },

    // Submit dispute for review
    submitForReview: (disputeId) => {
      set((state) => ({
        disputes: state.disputes.map((d) =>
          d.id === disputeId ? { ...d, status: 'under-review' } : d
        ),
      }))
      return { success: true, message: 'Dispute submitted for review' }
    },

    // Assign arbitrator
    assignArbitrator: (disputeId, arbitrator) => {
      set((state) => ({
        disputes: state.disputes.map((d) =>
          d.id === disputeId ? { ...d, arbitrator } : d
        ),
      }))
    },

    // Resolve dispute
    resolveDispute: (disputeId, resolution) => {
      set((state) => ({
        disputes: state.disputes.map((d) =>
          d.id === disputeId
            ? {
                ...d,
                status: 'resolved',
                resolution,
                refundAmount: resolution.amount || 0,
              }
            : d
        ),
      }))
      return { success: true, message: 'Dispute resolved' }
    },

    // Close dispute
    closeDispute: (disputeId) => {
      set((state) => ({
        disputes: state.disputes.map((d) =>
          d.id === disputeId ? { ...d, status: 'closed' } : d
        ),
      }))
    },

    // Get dispute statistics
    getDisputeStats: () => {
      const disputes = get().disputes
      return {
        total: disputes.length,
        open: disputes.filter((d) => d.status === 'open').length,
        underReview: disputes.filter((d) => d.status === 'under-review').length,
        resolved: disputes.filter((d) => d.status === 'resolved').length,
        closed: disputes.filter((d) => d.status === 'closed').length,
        totalRefunded: disputes.reduce((sum, d) => sum + (d.refundAmount || 0), 0),
      }
    },

    // Get disputes for arbitrator
    getArbitratorDisputes: (arbitratorName) => {
      return get().disputes.filter(
        (d) => d.arbitrator?.name === arbitratorName || d.status === 'under-review'
      )
    },

    // Calculate dispute rating impact
    getDisputeImpact: (userName) => {
      const userDisputes = get().getUserDisputes(userName)
      const resolvedAgainstUser = userDisputes.filter((d) => {
        if (d.resolution?.decision === 'refund' && d.respondent.name === userName)
          return true
        if (
          d.resolution?.decision === 'partial_refund' &&
          d.respondent.name === userName
        )
          return true
        return false
      })
      return {
        disputeCount: userDisputes.length,
        resolvedAgainstCount: resolvedAgainstUser.length,
        ratingImpact: -resolvedAgainstUser.length * 0.1,
      }
    },
  }))
)
