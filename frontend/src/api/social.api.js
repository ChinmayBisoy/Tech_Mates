import instance from './axios';

export const socialAPI = {
  getDiscoverUsers: async () => {
    const response = await instance.get('/social/discover');
    return response.data;
  },

  getRequests: async () => {
    const response = await instance.get('/social/requests');
    return response.data;
  },

  getConnections: async () => {
    const response = await instance.get('/social/connections');
    return response.data;
  },

  sendRequest: async (targetUserId) => {
    const response = await instance.post('/social/requests', { targetUserId });
    return response.data;
  },

  respondToRequest: async (requestId, action) => {
    const response = await instance.patch(`/social/requests/${requestId}/respond`, { action });
    return response.data;
  },

  getMySocialProfile: async () => {
    const response = await instance.get('/social/profile/me');
    return response.data;
  },

  updateMySocialProfile: async (payload) => {
    const response = await instance.put('/social/profile/me', payload);
    return response.data;
  },
};
