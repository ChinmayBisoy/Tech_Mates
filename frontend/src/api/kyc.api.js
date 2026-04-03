import instance from './axios';

const kycApi = {
  // Save personal info (Step 1)
  savePersonalInfo: async (data) => {
    const response = await instance.post('/kyc/save-personal-info', data);
    return response.data;
  },

  // Submit KYC with personal info
  submitKYC: async (data) => {
    const response = await instance.post('/kyc/submit', data);
    return response.data;
  },

  // Resubmit KYC after rejection
  resubmitKYC: async (data) => {
    const response = await instance.post('/kyc/resubmit', data);
    return response.data;
  },

  // Upload a document
  uploadDocument: async (formData) => {
    const response = await instance.post('/kyc/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get KYC status
  getStatus: async () => {
    const response = await instance.get('/kyc/status');
    return response.data;
  },

  // Admin endpoints
  getPendingKYC: async () => {
    const response = await instance.get('/kyc/admin/pending');
    return response.data;
  },

  approveKYC: async (userId) => {
    const response = await instance.post(`/kyc/admin/${userId}/approve`);
    return response.data;
  },

  rejectKYC: async (userId, reason) => {
    const response = await instance.post(`/kyc/admin/${userId}/reject`, { reason });
    return response.data;
  },
};

export default kycApi;
