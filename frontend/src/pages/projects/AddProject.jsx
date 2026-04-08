import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader, Upload, X, Plus, Sparkles, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import * as projectAPI from '@/api/project.api'
import * as proposalAPI from '@/api/proposal.api'
import { SKILLS } from '@/utils/constants'

const addProjectSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(150, 'Title must be at most 150 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters').max(5000, 'Description must be at most 5000 characters'),
  category: z.enum(['web_app', 'mobile_app', 'desktop', 'saas', 'ecommerce', 'api', 'custom'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  budget: z.object({
    min: z.number().min(1000, 'Minimum budget must be at least ₹1000'),
    max: z.number().min(1000, 'Maximum budget must be at least ₹1000'),
  }).refine(data => data.max >= data.min, {
    message: 'Maximum budget must be greater than or equal to minimum',
    path: ['max'],
  }),
  timeline: z.enum(['1week', '2weeks', '1month', '2months', '3months', '6months', 'flexible'], {
    errorMap: () => ({ message: 'Please select a valid timeline' }),
  }),
  skills: z.array(z.string()).min(1, 'Select at least one required skill').max(10, 'Maximum 10 skills'),
  deliverables: z.string().min(20, 'Describe deliverables in at least 20 characters'),
  attachments: z.array(z.any()).optional(),
})

export default function AddProject() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedSkills, setSelectedSkills] = useState([])
  const [attachments, setAttachments] = useState([])
  const [attachmentPreviews, setAttachmentPreviews] = useState([])
  const [projectCount, setProjectCount] = useState(0)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const [isCheckingLimit, setIsCheckingLimit] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      budget: { min: 10000, max: 50000 },
      timeline: '1month',
      skills: [],
      deliverables: '',
    },
  })

  const description = watch('description')
  const title = watch('title')

  // Check project limit on component mount
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const response = await projectAPI.checkProjectLimit()
        // Handle both direct count and paginated response
        const count = response?.pagination?.total || response?.total || response?.length || 0
        setProjectCount(count)
        
        // Only set limit reached if count is 2 or more
        if (count >= 2) {
          setIsLimitReached(true)
        } else {
          setIsLimitReached(false)
        }
      } catch (error) {
        // Only treat 403 from CREATE as limit reached, not from LIST
        // For LIST endpoint, any error means we should let user try
        console.error('Error checking project limit:', error)
        setIsLimitReached(false)
        setProjectCount(0)
      } finally {
        setIsCheckingLimit(false)
      }
    }

    if (user) {
      checkLimit()
    }
  }, [user])

  const createProjectMutation = useMutation({
    mutationFn: async (formData) => {
      return projectAPI.createProject({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: formData.budget,
        timeline: formData.timeline,
        skills: selectedSkills,
        deliverables: formData.deliverables,
        attachments,
      })
    },
    onSuccess: (data) => {
      toast.success('Project created successfully!')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // Re-check limit after creation
      projectAPI.checkProjectLimit().then(response => {
        const count = response?.pagination?.total || response?.total || response?.length || 0
        setProjectCount(count)
        if (count >= 2) {
          setIsLimitReached(true)
        }
      }).catch(err => console.error('Error rechecking limit:', err))
      navigate('/projects/marketplace', { state: { newProjectId: data._id } })
    },
    onError: (error) => {
      // Handle 403 limit reached error specifically
      if (error.response?.status === 403) {
        setIsLimitReached(true)
        toast.error(error.response?.data?.message || 'Project limit reached. Upgrade to Pro to post more.')
      } else {
        toast.error(error.message || error.response?.data?.message || 'Failed to create project')
      }
    },
  })

  const generateAIDescription = async () => {
    if (!title) {
      toast.error('Please enter a title first')
      return
    }

    try {
      const response = await proposalAPI.generateCoverLetter(
        title,
        '',
        selectedSkills,
        {}
      )
      
      setValue('description', response)
      toast.success('AI description generated!')
    } catch (error) {
      toast.error('Failed to generate AI description')
    }
  }

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const maxFiles = 3
    
    if (files.length + attachments.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} attachments allowed`)
      return
    }

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 10MB)`)
        return
      }

      setAttachments((prev) => [...prev, file])

      const reader = new FileReader()
      reader.onload = (e) => {
        setAttachmentPreviews((prev) => [...prev, { name: file.name, url: e.target.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => prev.filter((s) => s !== skill))
    } else if (selectedSkills.length < 10) {
      setSelectedSkills((prev) => [...prev, skill])
    } else {
      toast.error('Maximum 10 skills allowed')
    }
  }

  const onSubmit = handleSubmit((data) => {
    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill')
      return
    }
    createProjectMutation.mutate({ ...data, skills: selectedSkills })
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4">
            <Plus className="w-4 h-4" />
            Add New Project
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Post Your Project</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Connect with talented developers and get your project built
          </p>
          {!isCheckingLimit && (
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
              Projects created: <strong>{projectCount}/2</strong>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Project Limit Alert */}
          {isLimitReached && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200">Project Limit Reached</h3>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                    You have reached the maximum of <strong>2 projects</strong> without a Pro subscription. 
                    Upgrade to Pro to post unlimited projects and get advanced features.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/subscription')}
                    className="mt-3 inline-block px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800 transition"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
          )}

          {isCheckingLimit && (
            <div className="flex justify-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          )}

          {isLimitReached ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-900">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Cannot Create More Projects
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upgrade your subscription to create more projects
              </p>
              <button
                type="button"
                onClick={() => navigate('/subscription')}
                className="inline-block px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition"
              >
                View Subscription Plans
              </button>
            </div>
          ) : (
            <>
          {/* Project Title */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-8 shadow-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Build a Social Network App"
                  {...register('title')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                <p className="mt-1 text-xs text-gray-500">{title.length}/150 characters</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                    Project Description <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate with AI
                  </button>
                </div>
                <textarea
                  placeholder="Describe your project in detail. What do you want to build? What are your goals?"
                  {...register('description')}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                <p className="mt-1 text-xs text-gray-500">{description.length}/5000 characters</p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Project Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                >
                  <option value="">Select a category</option>
                  <option value="web_app">Web Application</option>
                  <option value="mobile_app">Mobile Application</option>
                  <option value="desktop">Desktop Application</option>
                  <option value="saas">SaaS Product</option>
                  <option value="ecommerce">E-commerce Platform</option>
                  <option value="api">API Development</option>
                  <option value="custom">Custom Development</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Project Timeline <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('timeline')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                >
                  <option value="">Select timeline</option>
                  <option value="1week">1 Week</option>
                  <option value="2weeks">2 Weeks</option>
                  <option value="1month">1 Month</option>
                  <option value="2months">2 Months</option>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="flexible">Flexible</option>
                </select>
                {errors.timeline && <p className="mt-1 text-sm text-red-600">{errors.timeline.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Minimum Budget (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  {...register('budget.min', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                {errors.budget?.min && <p className="mt-1 text-sm text-red-600">{errors.budget.min.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Maximum Budget (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  {...register('budget.max', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
                {errors.budget?.max && <p className="mt-1 text-sm text-red-600">{errors.budget.max.message}</p>}
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Required Skills</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length === 0 && <p className="mt-2 text-sm text-red-600">Select at least one skill</p>}
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{selectedSkills.length}/10 skills selected</p>
          </div>

          {/* Deliverables */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-8 shadow-lg">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Deliverables <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="What will you deliver? List all deliverables, features, and components."
              {...register('deliverables')}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
            />
            {errors.deliverables && <p className="mt-1 text-sm text-red-600">{errors.deliverables.message}</p>}
          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-surface/80 backdrop-blur p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Attachments</h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-900 dark:text-white font-semibold">Drop files here or click to browse</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Max 3 files, 10MB each</p>
              <input
                type="file"
                multiple
                onChange={handleAttachmentUpload}
                className="hidden"
                id="attachments"
                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
              />
              <label htmlFor="attachments" className="inline-block mt-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('attachments').click()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Choose Files
                </button>
              </label>
            </div>

            {attachmentPreviews.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachmentPreviews.map((preview, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white truncate">{preview.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || createProjectMutation.isPending}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting || createProjectMutation.isPending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Post Project
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/projects/marketplace')}
              className="px-6 py-4 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
