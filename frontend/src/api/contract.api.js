import instance from './axios'

// Fetch all contracts
const fetchContracts = async (page = 1, limit = 10, status = null) => {
  const response = await instance.get(`/contracts`, {
    params: { page, limit, ...(status && { status }) },
  })
  return response.data
}

// Get contract detail
const getContractDetail = async (contractId) => {
  const response = await instance.get(`/contracts/${contractId}`)
  return response.data
}

// Get my contracts (current user)
const getMyContracts = async (page = 1, limit = 10) => {
  const response = await instance.get(`/contracts`, {
    params: { page, limit },
  })
  return response.data
}

// Fund a milestone
const fundMilestone = async (contractId, milestoneId) => {
  const response = await instance.post(
    `/payments/fund-milestone`,
    { contractId, milestoneId }
  )
  return response.data
}

// Submit work for milestone
const submitWork = async (contractId, milestoneId, data) => {
  const response = await instance.put(
    `/contracts/${contractId}/milestone/${milestoneId}/submit`,
    data
  )
  return response.data
}

// Approve milestone submission
const approveMilestone = async (contractId, milestoneId) => {
  const response = await instance.put(
    `/contracts/${contractId}/milestone/${milestoneId}/approve`
  )
  return response.data
}

// Request revision for milestone
const requestRevision = async (contractId, milestoneId, data) => {
  const response = await instance.put(
    `/contracts/${contractId}/milestone/${milestoneId}/request-revision`,
    data
  )
  return response.data
}

// Dispute a milestone
const disputeMilestone = async (contractId, milestoneId, data) => {
  const response = await instance.put(
    `/contracts/${contractId}/milestone/${milestoneId}/dispute`,
    data
  )
  return response.data
}

// Release milestone payment (after acceptance)
const releaseMilestonePayment = async (contractId, milestoneId) => {
  const response = await instance.post(
    `/payments/release-milestone`,
    { contractId, milestoneId }
  )
  return response.data
}

// Get contract milestones
const getMilestones = async (contractId) => {
  const response = await instance.get(`/contracts/${contractId}`)
  return response.data
}

// Update contract status
const updateContractStatus = async (contractId, status) => {
  const response = await instance.put(`/contracts/${contractId}/status`, {
    status,
  })
  return response.data
}

// Cancel contract
const cancelContract = async (contractId, reason) => {
  const response = await instance.post(`/contracts/${contractId}/cancel`, {
    reason,
  })
  return response.data
}

// Get contract chat room
const getContractChat = async (contractId) => {
  const response = await instance.get(`/contracts/${contractId}/chat`)
  return response.data
}

// Close/Complete contract
const completeContract = async (contractId) => {
  const response = await instance.post(`/contracts/${contractId}/complete`)
  return response.data
}

// Export object for backward compatibility
export const contractAPI = {
  fetchContracts,
  getContractDetail,
  getMyContracts,
  fundMilestone,
  submitWork,
  approveMilestone,
  requestRevision,
  disputeMilestone,
  releaseMilestonePayment,
  getMilestones,
  updateContractStatus,
  cancelContract,
  getContractChat,
  completeContract,
}

// Export individual functions
export {
  fetchContracts,
  getContractDetail,
  getMyContracts,
  fundMilestone,
  submitWork,
  approveMilestone,
  requestRevision,
  disputeMilestone,
  releaseMilestonePayment,
  getMilestones,
  updateContractStatus,
  cancelContract,
  getContractChat,
  completeContract,
}
