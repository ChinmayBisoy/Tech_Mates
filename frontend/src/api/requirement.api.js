import instance from './axios'

const fetchRequirements = async (filters = {}, page = 1, limit = 12) => {
  const response = await instance.get('/requirements', {
    params: { ...filters, page, limit },
  })
  return response.data
}

const fetchOpenRequirements = async (limit = 6) => {
  const response = await instance.get('/requirements', {
    params: { status: 'open', limit },
  })
  return response.data
}

const getRequirementDetail = async (id) => {
  const response = await instance.get(`/requirements/${id}`)
  return response.data
}

const getRequirementProposals = async (id) => {
  const response = await instance.get(`/proposals/requirement/${id}`)
  return response.data
}

const getMyRequirements = async (page = 1, limit = 12) => {
  const response = await instance.get('/requirements/my', {
    params: { page, limit },
  })
  return response.data
}

const createRequirement = async (data) => {
  const response = await instance.post('/requirements', data)
  return response.data
}

const updateRequirement = async (id, data) => {
  const response = await instance.put(`/requirements/${id}`, data)
  return response.data
}

const deleteRequirement = async (id) => {
  const response = await instance.delete(`/requirements/${id}`)
  return response.data
}

const closeRequirement = async (id) => {
  const response = await instance.put(`/requirements/${id}/close`, {})
  return response.data
}

// Export object for backward compatibility with Home page
export const requirementAPI = {
  fetchRequirements,
  fetchOpenRequirements,
  getRequirementDetail,
  getRequirementProposals,
  getMyRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  closeRequirement,
}

// Export individual functions for pages
export {
  fetchRequirements,
  fetchOpenRequirements,
  getRequirementDetail,
  getRequirementProposals,
  getMyRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  closeRequirement,
}
