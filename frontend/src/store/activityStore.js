import { create } from 'zustand'

// Mock activity data - replace with API calls later
const mockActivities = [
  {
    id: 1,
    type: 'project_posted',
    title: 'E-commerce Platform Redesign',
    description: 'Need a React developer to redesign our e-commerce platform with modern UI',
    user: {
      id: 'user1',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'client'
    },
    category: 'Web Development',
    budget: '$2,000 - $5,000',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
    icon: '📋'
  },
  {
    id: 2,
    type: 'developer_hired',
    title: 'Developer Hired for Mobile App',
    description: 'Alex Chen was hired for React Native mobile app development',
    user: {
      id: 'dev1',
      name: 'Alex Chen',
      avatar: 'https://i.pravatar.cc/150?img=2',
      role: 'developer'
    },
    category: 'Mobile Development',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    icon: '✅'
  },
  {
    id: 3,
    type: 'project_completed',
    title: 'Landing Page Project Completed',
    description: 'Maria Rodriguez completed a modern landing page project with 5⭐ rating',
    user: {
      id: 'dev2',
      name: 'Maria Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'developer',
      rating: 5
    },
    category: 'Web Design',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    icon: '🎉'
  },
  {
    id: 4,
    type: 'requirement_posted',
    title: 'Need Python Backend Developer',
    description: 'Looking for an experienced Python developer for Django REST API project',
    user: {
      id: 'user2',
      name: 'TechStartup Inc',
      avatar: 'https://i.pravatar.cc/150?img=4',
      role: 'client'
    },
    category: 'Backend Development',
    budget: '$50/hr - $100/hr',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    icon: '🐍'
  },
  {
    id: 5,
    type: 'milestone_completed',
    title: 'Project Milestone Reached',
    description: 'Design phase milestone completed on schedule for the AI Dashboard project',
    user: {
      id: 'team1',
      name: 'Design Team Pro',
      avatar: 'https://i.pravatar.cc/150?img=5',
      role: 'developer'
    },
    category: 'Project Milestone',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    icon: '🎯'
  },
  {
    id: 6,
    type: 'proposal_submitted',
    title: 'New Proposal Submitted',
    description: 'James Wilson submitted a proposal for the UI/UX Design project',
    user: {
      id: 'dev3',
      name: 'James Wilson',
      avatar: 'https://i.pravatar.cc/150?img=6',
      role: 'developer'
    },
    category: 'Design',
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 mins ago
    icon: '💼'
  },
  {
    id: 7,
    type: 'project_posted',
    title: 'Logo Design Needed',
    description: 'Need a creative logo design for our new SaaS product',
    user: {
      id: 'user3',
      name: 'Creative Ventures',
      avatar: 'https://i.pravatar.cc/150?img=7',
      role: 'client'
    },
    category: 'Design',
    budget: '$300 - $800',
    timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
    icon: '🎨'
  },
  {
    id: 8,
    type: 'developer_rated',
    title: 'Excellent 5-Star Review',
    description: 'Emily Zhang received a 5⭐ review: "Excellent work, very professional!"',
    user: {
      id: 'dev4',
      name: 'Emily Zhang',
      avatar: 'https://i.pravatar.cc/150?img=8',
      role: 'developer',
      rating: 5
    },
    category: 'Reviews',
    timestamp: new Date(Date.now() - 150 * 60 * 1000), // 2.5 hours ago
    icon: '⭐'
  }
]

export const useActivityStore = create((set) => ({
  activities: mockActivities,
  filteredActivities: mockActivities,
  filter: 'all', // all, project_posted, completed, hired, reviews

  // Set activities (for future API integration)
  setActivities: (activities) => set({ activities }),

  // Filter activities by type
  filterActivities: (filterType) => {
    set((state) => {
      let filtered = state.activities
      
      if (filterType !== 'all') {
        filtered = state.activities.filter(activity => {
          if (filterType === 'posted') {
            return ['project_posted', 'requirement_posted'].includes(activity.type)
          }
          if (filterType === 'completed') {
            return ['project_completed', 'milestone_completed'].includes(activity.type)
          }
          if (filterType === 'hired') {
            return activity.type === 'developer_hired'
          }
          if (filterType === 'reviews') {
            return activity.type === 'developer_rated'
          }
          return true
        })
      }
      
      return {
        filter: filterType,
        filteredActivities: filtered
      }
    })
  },

  // Simulate real-time activity (add new activity to top)
  addNewActivity: (activity) => {
    set((state) => {
      const newActivities = [activity, ...state.activities]
      return {
        activities: newActivities,
        filteredActivities: [activity, ...state.filteredActivities]
      }
    })
  },

  // Clear all activities
  clearActivities: () => set({ activities: [], filteredActivities: [] })
}))
