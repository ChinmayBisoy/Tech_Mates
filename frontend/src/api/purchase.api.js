import axios from './axios';

// Fetch all purchases for current user
export const fetchMyPurchases = async (page = 1, limit = 10, status = null) => {
  const response = await axios.get(`/purchases/my`, {
    params: { page, limit, ...(status && { status }) },
  });
  return response.data;
};

// Get purchase by ID
export const getPurchase = async (purchaseId) => {
  const response = await axios.get(`/purchases/${purchaseId}`);
  return response.data;
};

// Create a purchase (initiate checkout)
export const createPurchase = async (listingId) => {
  const response = await axios.post(`/purchases`, { listingId });
  return response.data;
};

// Download purchased listing files
export const downloadPurchasedFiles = async (purchaseId) => {
  const response = await axios.get(`/purchases/${purchaseId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// Verify purchase session after Stripe payment (get purchase details by Stripe session ID)
// TODO: Backend should implement GET /purchases/verify-session/:sessionId or similar
// For now, this placeholder can be called after payment success redirects back
export const verifyPurchaseSession = async (sessionId) => {
  // Temporary implementation: return mock data
  // Replace with actual backend call when /purchases/verify-session/:sessionId is implemented
  try {
    const response = await axios.get(`/purchases/verify-session`, {
      params: { sessionId }
    });
    return response.data;
  } catch (error) {
    // Fallback: return mock purchase data (user can fetch from /purchases/my after full sync)
    console.warn('Purchase verification endpoint not yet implemented on backend');
    return {
      amount: 0,
      listing: { title: 'Listing' },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
};
