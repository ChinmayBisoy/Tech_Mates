import instance from './axios'

// Create a new proposal
const createProposal = async (requirementId, data) => {
  const response = await instance.post('/proposals', {
    requirementId,
    ...data,
  })
  return response.data
}

// Get all proposals for a requirement
const getRequirementProposals = async (requirementId, page = 1, limit = 10) => {
  const response = await instance.get(`/proposals/requirement/${requirementId}`, {
    params: { page, limit },
  })
  return response.data
}

// Get all proposals by current developer
const getMyProposals = async (page = 1, limit = 10, status = null) => {
  const response = await instance.get(`/proposals/my`, {
    params: { page, limit, ...(status && { status }) },
  })
  return response.data
}

// Get single proposal detail
const getProposalDetail = async (proposalId) => {
  const response = await instance.get(`/proposals/requirement/${proposalId}`)
  return response.data
}

// Accept proposal (requirement owner only)
const acceptProposal = async (proposalId) => {
  const response = await instance.put(`/proposals/${proposalId}/accept`)
  return response.data
}

// Reject proposal (requirement owner only)
const rejectProposal = async (proposalId) => {
  const response = await instance.put(`/proposals/${proposalId}/reject`)
  return response.data
}

// Shortlist proposal (requirement owner can view favorites)
const shortlistProposal = async (proposalId) => {
  const response = await instance.put(`/proposals/${proposalId}/shortlist`)
  return response.data
}

// Withdraw proposal (developer only)
const withdrawProposal = async (proposalId) => {
  const response = await instance.put(`/proposals/${proposalId}/withdraw`)
  return response.data
}

// Update proposal
const updateProposal = async (proposalId, data) => {
  const response = await instance.put(`/proposals/${proposalId}`, data)
  return response.data
}

// Delete proposal
const deleteProposal = async (proposalId) => {
  const response = await instance.delete(`/proposals/${proposalId}`)
  return response.data
}

// Boost proposal
const boostProposal = async (proposalId) => {
  const response = await instance.post(`/proposals/${proposalId}/boost`)
  return response.data
}

// Generate AI cover letter
const generateCoverLetter = async (projectTitle, projectDescription, developerSkills, budgetRange) => {
  const response = await instance.post('/ai/generate-cover-letter', {
    projectTitle,
    projectDescription,
    developerSkills,
    budgetRange,
  })
  return response.data
}

// Export object for backward compatibility
export const proposalAPI = {
  createProposal,
  getRequirementProposals,
  getMyProposals,
  getProposalDetail,
  acceptProposal,
  rejectProposal,
  shortlistProposal,
  withdrawProposal,
  updateProposal,
  deleteProposal,
  boostProposal,
  generateCoverLetter,
}

// Export individual functions
export {
  createProposal,
  getRequirementProposals,
  getMyProposals,
  getProposalDetail,
  acceptProposal,
  rejectProposal,
  shortlistProposal,
  withdrawProposal,
  updateProposal,
  deleteProposal,
  boostProposal,
  generateCoverLetter,
}
