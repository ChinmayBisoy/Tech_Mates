import { create } from 'zustand';

export const useSocialStore = create((set) => ({
  // Current user's profile
  userProfile: {
    id: 'user_123',
    username: 'john_collector',
    email: 'john@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    fullName: 'John Doe',
    bio: 'Passionate collector of vintage tech and rare items',
    location: 'San Francisco, CA',
    joinDate: new Date('2023-06-15'),
    followers: 342,
    following: 128,
    averageRating: 4.8,
    totalReviews: 156,
    successfulTransactions: 289,
    trustScore: 95,
    verifiedBadges: ['email_verified', 'phone_verified', 'seller_verified'],
    website: 'https://johncollector.com',
    socialLinks: {
      twitter: '@johncollector',
      instagram: '@johncollector',
    },
  },

  // Other user profiles (search results)
  userProfiles: [
    {
      id: 'user_456',
      username: 'alice_seller',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      fullName: 'Alice Smith',
      bio: 'Selling quality vintage furniture',
      averageRating: 4.9,
      followers: 892,
      trustScore: 98,
      verifiedBadges: ['email_verified', 'seller_verified'],
    },
    {
      id: 'user_789',
      username: 'bob_buyer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      fullName: 'Bob Johnson',
      bio: 'Art enthusiast and collector',
      averageRating: 4.6,
      followers: 234,
      trustScore: 92,
      verifiedBadges: ['email_verified'],
    },
  ],

  // Messages/Conversations
  conversations: [
    {
      id: 'conv_1',
      participantId: 'user_456',
      participantName: 'alice_seller',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      lastMessage: 'Great, shipping tomorrow!',
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 0,
      messages: [
        { id: 'm1', sender: 'alice_seller', content: 'Thanks for order!', timestamp: new Date(Date.now() - 7200000) },
        { id: 'm2', sender: 'john_collector', content: 'How soon can you ship?', timestamp: new Date(Date.now() - 5400000) },
        { id: 'm3', sender: 'alice_seller', content: 'Great, shipping tomorrow!', timestamp: new Date(Date.now() - 3600000) },
      ],
    },
    {
      id: 'conv_2',
      participantId: 'user_789',
      participantName: 'bob_buyer',
      participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      lastMessage: 'This artwork is amazing!',
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 2,
      messages: [],
    },
  ],

  // Forum threads and posts
  forumThreads: [
    {
      id: 'forum_1',
      title: 'Best practices for storing vintage items',
      author: 'alice_seller',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      category: 'Collecting Tips',
      createdAt: new Date(Date.now() - 259200000),
      views: 1240,
      repliesCount: 18,
      lastReplyAt: new Date(Date.now() - 3600000),
      content: 'I want to share my experience with proper storage...',
      likes: 89,
      tags: ['storage', 'vintage', 'preservation'],
    },
    {
      id: 'forum_2',
      title: 'How to spot counterfeits?',
      author: 'bob_buyer',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      category: 'Buying Guide',
      createdAt: new Date(Date.now() - 432000000),
      views: 3450,
      repliesCount: 42,
      lastReplyAt: new Date(Date.now() - 172800000),
      content: 'Any tips on authentication?',
      likes: 234,
      tags: ['authentication', 'buying', 'tips'],
    },
  ],

  // Reviews given and received
  reviews: [
    {
      id: 'review_1',
      ratingGiven: 5,
      reviewer: 'alice_seller',
      reviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      comment: 'Excellent buyer! Fast payment and great communication.',
      transactionId: 'TRX_001',
      createdAt: new Date(Date.now() - 604800000),
    },
    {
      id: 'review_2',
      ratingGiven: 4,
      reviewer: 'bob_buyer',
      reviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      comment: 'Good seller, minor packaging issue but resolved quickly.',
      transactionId: 'TRX_002',
      createdAt: new Date(Date.now() - 777600000),
    },
  ],

  // Followers/Following lists
  followers: [
    {
      id: 'follower_1',
      username: 'alice_seller',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      followedAt: new Date(Date.now() - 2592000000),
    },
    {
      id: 'follower_2',
      username: 'bob_buyer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      followedAt: new Date(Date.now() - 1296000000),
    },
  ],

  following: [
    {
      id: 'following_1',
      username: 'alice_seller',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      followedAt: new Date(Date.now() - 2592000000),
    },
  ],

  // Actions
  updateUserProfile: (updates) => {
    set((state) => ({
      userProfile: {
        ...state.userProfile,
        ...updates,
      },
    }));
  },

  sendMessage: (conversationId, message) => {
    set((state) => ({
      conversations: state.conversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: `m_${Date.now()}`,
                sender: state.userProfile.username,
                content: message,
                timestamp: new Date(),
              },
            ],
            lastMessage: message,
            lastMessageTime: new Date(),
          };
        }
        return conv;
      }),
    }));
  },

  getConversation: (conversationId) => {
    return (state) => state.conversations.find(c => c.id === conversationId);
  },

  addFollower: (user) => {
    set((state) => ({
      followers: [
        {
          id: `follower_${Date.now()}`,
          ...user,
          followedAt: new Date(),
        },
        ...state.followers,
      ],
      userProfile: {
        ...state.userProfile,
        followers: state.userProfile.followers + 1,
      },
    }));
  },

  followUser: (user) => {
    set((state) => ({
      following: [
        {
          id: `following_${Date.now()}`,
          ...user,
          followedAt: new Date(),
        },
        ...state.following,
      ],
      userProfile: {
        ...state.userProfile,
        following: state.userProfile.following + 1,
      },
    }));
  },

  unfollowUser: (userId) => {
    set((state) => ({
      following: state.following.filter(f => f.id !== userId),
      userProfile: {
        ...state.userProfile,
        following: Math.max(0, state.userProfile.following - 1),
      },
    }));
  },

  addForumThread: (thread) => {
    set((state) => ({
      forumThreads: [
        {
          id: `forum_${Date.now()}`,
          author: state.userProfile.username,
          authorAvatar: state.userProfile.avatar,
          createdAt: new Date(),
          views: 0,
          repliesCount: 0,
          likes: 0,
          ...thread,
        },
        ...state.forumThreads,
      ],
    }));
  },

  addReview: (review) => {
    set((state) => ({
      reviews: [
        {
          id: `review_${Date.now()}`,
          createdAt: new Date(),
          ...review,
        },
        ...state.reviews,
      ],
      userProfile: {
        ...state.userProfile,
        totalReviews: state.userProfile.totalReviews + 1,
      },
    }));
  },

  searchProfiles: (query) => {
    return (state) =>
      state.userProfiles.filter(
        p =>
          p.username.toLowerCase().includes(query.toLowerCase()) ||
          p.fullName.toLowerCase().includes(query.toLowerCase())
      );
  },

  getUnreadMessageCount: () => {
    return (state) => state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  },
}));
