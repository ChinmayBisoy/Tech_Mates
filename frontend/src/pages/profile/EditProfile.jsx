import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Loader, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { userAPI } from '@/api/user.api'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { SkillTags } from '@/components/profile/SkillTags'
import { PageLoader } from '@/components/shared/PageLoader'
import { ErrorState } from '@/components/shared/ErrorState'
import { SKILLS } from '@/utils/constants'
import { cn } from '@/utils/cn'

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9._]+$/, 'Use lowercase letters, numbers, dots, or underscores only'),
  email: z.string().email('Invalid email'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  portfolioLinks: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUsername: z.string().optional(),
  linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  instagram: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
})

export function EditProfile() {
  const { user, isDeveloper } = useAuth()
  const { updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])

  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['profile', 'edit'],
    queryFn: () => userAPI.getMe(),
  })

  const profile = profileResponse || {}

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    values: {
      name: profile.name || '',
      username: profile.username || '',
      email: profile.email || '',
      bio: profile.bio || '',
      location: profile.location || '',
      portfolioLinks: Array.isArray(profile.portfolioLinks) ? profile.portfolioLinks.join(', ') : '',
      website: profile.website || '',
      githubUsername: profile.githubUsername || '',
      linkedin: profile.linkedin || '',
      instagram: profile.instagram || '',
      skills: profile.skills || [],
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (file) => userAPI.uploadAvatar(file),
    onSuccess: (response) => {
      const updatedProfile = response
      updateUser(updatedProfile)
      queryClient.setQueryData(['profile', 'edit'], response)
      setAvatarPreview(null)
      toast.success('Avatar updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: (response) => {
      const updatedProfile = response
      updateUser(updatedProfile)
      queryClient.setQueryData(['profile', 'edit'], response)
      toast.success('Profile updated successfully')
    },
    onError: (error) => {
      const firstError = error.response?.data?.errors?.[0]?.message
      toast.error(firstError || error.response?.data?.message || 'Failed to update profile')
    },
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload
    uploadAvatarMutation.mutate(file)
  }

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      username: data.username,
      bio: data.bio,
      location: data.location,
      website: data.website,
      linkedin: data.linkedin,
      instagram: data.instagram,
      githubUsername: data.githubUsername,
      skills: data.skills,
      portfolioLinks: (data.portfolioLinks || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }

    // Backend URL fields are optional, so send them only when non-empty.
    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => {
        if (Array.isArray(value)) {
          return value.length > 0
        }
        if (typeof value === 'string') {
          return value.trim().length > 0
        }
        return value !== undefined && value !== null
      })
    )

    updateProfileMutation.mutate(sanitizedPayload)
  }

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  if (profileLoading) return <PageLoader />

  if (profileError) {
    return (
      <div className="min-h-screen bg-white dark:bg-base py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <ErrorState
            title="Failed to load profile"
            message="Could not load your profile. Please try again."
            onRetry={() => refetchProfile()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your profile information
          </p>
        </div>

        <div className="card p-8 space-y-8">
          {/* Avatar Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Avatar
            </h2>

            <div className="flex items-center gap-6">
              {/* Avatar Preview */}
              <div>
                {avatarPreview || profile.avatar ? (
                  <img
                    src={avatarPreview || profile.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-600 rounded-xl flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {profile.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadAvatarMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Change Avatar
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Max 5MB. JPG, PNG, or GIF.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="input"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-danger text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-danger text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                disabled
                {...register('email')}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                className="input resize-none"
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-danger text-sm mt-1">{errors.bio.message}</p>
              )}
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="City, Country"
                className="input"
                {...register('location')}
              />
            </div>

            {/* Links Section */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-elevated rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Links
              </h3>

              <div>
                <label htmlFor="portfolioLinks" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Portfolio URLs (comma separated)
                </label>
                <input
                  id="portfolioLinks"
                  type="text"
                  placeholder="https://portfolio1.com, https://portfolio2.com"
                  className="input"
                  {...register('portfolioLinks')}
                />
                {errors.portfolioLinks && (
                  <p className="text-danger text-sm mt-1">
                    {errors.portfolioLinks.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="input"
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-danger text-sm mt-1">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="githubUsername" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  GitHub Username
                </label>
                <input
                  id="githubUsername"
                  type="text"
                  placeholder="yourusername"
                  className="input"
                  {...register('githubUsername')}
                />
                {errors.githubUsername && (
                  <p className="text-danger text-sm mt-1">
                    {errors.githubUsername.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  LinkedIn URL
                </label>
                <input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="input"
                  {...register('linkedin')}
                />
                {errors.linkedin && (
                  <p className="text-danger text-sm mt-1">
                    {errors.linkedin.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Instagram URL
                </label>
                <input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/yourprofile"
                  className="input"
                  {...register('instagram')}
                />
                {errors.instagram && (
                  <p className="text-danger text-sm mt-1">
                    {errors.instagram.message}
                  </p>
                )}
              </div>
            </div>

            {/* Skills Section (Developer only) */}
            {isDeveloper && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-elevated rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Skills
                </h3>

                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {SKILLS.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              const updated = field.value.includes(skill)
                                ? field.value.filter((s) => s !== skill)
                                : [...(field.value || []), skill]
                              field.onChange(updated)
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                              field.value?.includes(skill)
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            )}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>

                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((skill) => (
                            <div
                              key={skill}
                              className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-600/30 text-primary-700 dark:text-primary-100 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((s) => s !== skill)
                                  )
                                }}
                                className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || updateProfileMutation.isPending}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting || updateProfileMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
