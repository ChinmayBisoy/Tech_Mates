import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useEscrowStore = create(
  subscribeWithSelector((set, get) => ({
    escrows: [
      {
        id: 'E001',
        transactionId: 'TXN001',
        projectTitle: 'Website Redesign',
        buyer: {
          name: 'Acme Corp',
          avatar: '🏢',
          email: 'contact@acme.com',
        },
        seller: {
          name: 'John Developer',
          avatar: '👨‍💻',
          email: 'john@dev.com',
        },
        totalAmount: 5000,
        releasedAmount: 0,
        status: 'in-progress', // pending, in-progress, completed, disputed
        milestones: [
          {
            id: 'M1',
            title: 'UI Design & Mockups',
            percentage: 25,
            amount: 1250,
            status: 'completed',
            deliverables: ['Figma designs', 'Responsive mockups'],
            completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'M2',
            title: 'Frontend Development',
            percentage: 35,
            amount: 1750,
            status: 'in-progress',
            deliverables: ['React components', 'Routing setup'],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            progressPercentage: 60,
          },
          {
            id: 'M3',
            title: 'Backend Integration',
            percentage: 25,
            amount: 1250,
            status: 'pending',
            deliverables: ['API integration', 'Database setup'],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'M4',
            title: 'Testing & Deployment',
            percentage: 15,
            amount: 750,
            status: 'pending',
            deliverables: ['QA testing', 'Production deployment'],
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: 45,
      },
      {
        id: 'E002',
        transactionId: 'TXN002',
        projectTitle: 'Mobile App Development',
        buyer: {
          name: 'StartUp Inc',
          avatar: '🚀',
          email: 'team@startup.com',
        },
        seller: {
          name: 'Sarah Mobile Dev',
          avatar: '👩‍💼',
          email: 'sarah@mobile.com',
        },
        totalAmount: 8000,
        releasedAmount: 5000,
        status: 'completed',
        milestones: [
          {
            id: 'M1',
            title: 'App Architecture & Design',
            percentage: 20,
            amount: 1600,
            status: 'completed',
            deliverables: ['Technical docs', 'UI design'],
            completedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'M2',
            title: 'iOS Development',
            percentage: 40,
            amount: 3200,
            status: 'completed',
            deliverables: ['iOS app', 'App Store submission'],
            completedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'M3',
            title: 'Android Development',
            percentage: 40,
            amount: 3200,
            status: 'completed',
            deliverables: ['Android app', 'Play Store submission'],
            completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: 60,
      },
      {
        id: 'E003',
        transactionId: 'TXN003',
        projectTitle: 'Graphic Design Package',
        buyer: {
          name: 'Creative Brand',
          avatar: '🎨',
          email: 'brand@creative.com',
        },
        seller: {
          name: 'Lisa Designer',
          avatar: '👩‍🎨',
          email: 'lisa@design.com',
        },
        totalAmount: 2500,
        releasedAmount: 0,
        status: 'pending',
        milestones: [
          {
            id: 'M1',
            title: 'Logo & Brand Identity',
            percentage: 50,
            amount: 1250,
            status: 'pending',
            deliverables: ['Logo variations', 'Brand guidelines'],
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'M2',
            title: 'Marketing Materials',
            percentage: 50,
            amount: 1250,
            status: 'pending',
            deliverables: ['Business cards', 'Social media templates'],
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: 14,
      },
    ],

    paymentReleases: [
      {
        id: 'PR001',
        escrowId: 'E001',
        milestoneId: 'M1',
        amount: 1250,
        approvedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 'PR002',
        escrowId: 'E002',
        milestoneId: 'M1',
        amount: 1600,
        approvedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 'PR003',
        escrowId: 'E002',
        milestoneId: 'M2',
        amount: 3200,
        approvedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
      {
        id: 'PR004',
        escrowId: 'E002',
        milestoneId: 'M3',
        amount: 3200,
        approvedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
      },
    ],

    // Get all escrows
    getEscrows: () => get().escrows,

    // Get escrow by ID
    getEscrowById: (id) => get().escrows.find((e) => e.id === id),

    // Get buyer's escrows
    getBuyerEscrows: (buyerName) => {
      return get().escrows.filter((e) => e.buyer.name === buyerName)
    },

    // Get seller's escrows
    getSellerEscrows: (sellerName) => {
      return get().escrows.filter((e) => e.seller.name === sellerName)
    },

    // Get escrows by status
    getEscrowsByStatus: (status) => {
      return get().escrows.filter((e) => e.status === status)
    },

    // Complete milestone and request release
    releaseMilestonePayment: (escrowId, milestoneId) => {
      set((state) => ({
        escrows: state.escrows.map((escrow) =>
          escrow.id === escrowId
            ? {
                ...escrow,
                milestones: escrow.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, status: 'completed' } : m
                ),
              }
            : escrow
        ),
      }))
      return { success: true, message: 'Payment release requested' }
    },

    // Approve payment release
    approveMilestonePayment: (escrowId, milestoneId) => {
      const escrow = get().getEscrowById(escrowId)
      const milestone = escrow?.milestones.find((m) => m.id === milestoneId)

      if (!milestone) return { success: false, message: 'Milestone not found' }

      set((state) => ({
        escrows: state.escrows.map((e) =>
          e.id === escrowId
            ? {
                ...e,
                releasedAmount: e.releasedAmount + milestone.amount,
                status: e.milestones.every(
                  (m) => m.status === 'completed' || m.id === milestoneId
                )
                  ? 'completed'
                  : 'in-progress',
              }
            : e
        ),
        paymentReleases: [
          ...state.paymentReleases,
          {
            id: `PR${Date.now()}`,
            escrowId,
            milestoneId,
            amount: milestone.amount,
            approvedDate: new Date().toISOString(),
            status: 'completed',
          },
        ],
      }))

      return { success: true, message: 'Payment released successfully' }
    },

    // Create new escrow
    createEscrow: (escrowData) => {
      const newEscrow = {
        ...escrowData,
        id: `E${Date.now()}`,
        status: 'pending',
        releasedAmount: 0,
        createdDate: new Date().toISOString(),
      }
      set((state) => ({
        escrows: [...state.escrows, newEscrow],
      }))
      return newEscrow.id
    },

    // Get payment releases for escrow
    getPaymentReleases: (escrowId) => {
      return get().paymentReleases.filter((pr) => pr.escrowId === escrowId)
    },

    // Get milestone details
    getMilestoneDetails: (escrowId, milestoneId) => {
      const escrow = get().getEscrowById(escrowId)
      return escrow?.milestones.find((m) => m.id === milestoneId)
    },

    // Update milestone progress
    updateMilestoneProgress: (escrowId, milestoneId, progressPercentage) => {
      set((state) => ({
        escrows: state.escrows.map((e) =>
          e.id === escrowId
            ? {
                ...e,
                milestones: e.milestones.map((m) =>
                  m.id === milestoneId ? { ...m, progressPercentage } : m
                ),
              }
            : e
        ),
      }))
    },

    // Calculate total progress
    calculateTotalProgress: (escrowId) => {
      const escrow = get().getEscrowById(escrowId)
      if (!escrow) return 0
      const totalProgress = escrow.milestones.reduce(
        (sum, m) => sum + (m.progressPercentage || (m.status === 'completed' ? 100 : 0)) * m.percentage / 100,
        0
      )
      return Math.round(totalProgress)
    },
  }))
)
