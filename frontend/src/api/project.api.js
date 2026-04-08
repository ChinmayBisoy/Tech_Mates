import axios from './axios';

// Create a new project
export const createProject = async (projectData) => {
  const formData = new FormData();

  // Add form fields
  formData.append('title', projectData.title);
  formData.append('description', projectData.description);
  formData.append('category', projectData.category);
  formData.append('budget', JSON.stringify(projectData.budget));
  formData.append('timeline', projectData.timeline);
  formData.append('skills', JSON.stringify(projectData.skills));
  formData.append('deliverables', projectData.deliverables);

  // Add file attachments
  if (projectData.attachments && projectData.attachments.length > 0) {
    projectData.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const response = await axios.post('/projects/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

// Get all projects (marketplace)
export const getProjects = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.skills) {
    if (Array.isArray(filters.skills)) {
      filters.skills.forEach((skill) => params.append('skills', skill));
    } else {
      params.append('skills', filters.skills);
    }
  }
  if (filters.budget) params.append('budget', filters.budget);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await axios.get(`/projects?${params.toString()}`);
  return response;
};

// Get user's projects
export const getMyProjects = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await axios.get(`/projects/my?${params.toString()}`);
  return response;
};

// Get project by ID
export const getProjectById = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}`);
  return response;
};

// Update project
export const updateProject = async (projectId, updates) => {
  const formData = new FormData();

  Object.keys(updates).forEach((key) => {
    if (key === 'budget' || key === 'skills') {
      formData.append(key, JSON.stringify(updates[key]));
    } else {
      formData.append(key, updates[key]);
    }
  });

  // Handle attachments if provided
  if (updates.attachments && Array.isArray(updates.attachments)) {
    updates.attachments.forEach((file) => {
      if (file instanceof File) {
        formData.append('attachments', file);
      }
    });
  }

  const response = await axios.put(`/projects/${projectId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response;
};

// Delete project
export const deleteProject = async (projectId) => {
  const response = await axios.delete(`/projects/${projectId}`);
  return response;
};

// Get project proposals/bids
export const getProjectProposals = async (projectId) => {
  const response = await axios.get(`/projects/${projectId}/proposals`);
  return response;
};

// Send message to developer about project
export const sendProjectMessage = async (projectId, developerId, message) => {
  const response = await axios.post(`/projects/${projectId}/message/${developerId}`, {
    message,
  });

  return response;
};

// Get conversation with developer about project
export const getProjectConversation = async (projectId, developerId, page = 1, limit = 20) => {
  const response = await axios.get(`/projects/${projectId}/conversation/${developerId}`, {
    params: { page, limit },
  });

  return response;
};

// Check if user can post a new project (project limit)
export const checkProjectLimit = async () => {
  const response = await axios.get(`/projects/my?page=1&limit=100`);
  
  // Return the user's project count
  return response;
};
