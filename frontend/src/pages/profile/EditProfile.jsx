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
      // Also update the public profile cache with the user's ID
      if (user?._id || user?.id) {
        const userId = String(user._id || user.id)
        queryClient.setQueryData(['profile', userId], response)
      }
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
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50/50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50/50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
            Update your profile information
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)] space-y-8">
          {/* Avatar Section */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700/40 dark:to-slate-700/30 border border-blue-200/50 dark:border-slate-600/50 p-6">
            <div className="flex items-center gap-8">
              {/* Avatar Preview */}
              <div>
                {avatarPreview || profile.avatar ? (
                  <img
                    src={avatarPreview || profile.avatar}
                    alt="Avatar"
                    className="w-28 h-28 rounded-2xl object-cover ring-4 ring-blue-200 dark:ring-blue-700"
                  />
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-sky-500 rounded-2xl flex items-center justify-center ring-4 ring-blue-200 dark:ring-blue-700">
                    <span className="text-4xl font-bold text-white">
                      {profile.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Profile Picture</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">Upload a professional photo (max 5MB)</p>
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
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
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 px-4 py-3 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none cursor-not-allowed opacity-60"
                disabled
                {...register('email')}
              />
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                Email cannot be changed
              </p>
            </div>

            {/* Bio Field */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none transition-all"
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.bio.message}</p>
              )}
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="City, Country"
                className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                {...register('location')}
              />
            </div>

            {/* Links Section */}
            <div className="space-y-5 p-6 rounded-xl bg-blue-50 dark:bg-slate-700/30 border border-blue-200/50 dark:border-slate-600/50">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                Links
              </h3>

              <div>
                <label htmlFor="portfolioLinks" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Portfolio URLs <span className="text-slate-500 dark:text-slate-400 font-normal">(comma separated)</span>
                </label>
                <input
                  id="portfolioLinks"
                  type="text"
                  placeholder="https://portfolio1.com, https://portfolio2.com"
                  className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  {...register('portfolioLinks')}
                />
                {errors.portfolioLinks && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {errors.portfolioLinks.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="githubUsername" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  GitHub Username
                </label>
                <input
                  id="githubUsername"
                  type="text"
                  placeholder="yourusername"
                  className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  {...register('githubUsername')}
                />
                {errors.githubUsername && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {errors.githubUsername.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  LinkedIn URL
                </label>
                <input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  {...register('linkedin')}
                />
                {errors.linkedin && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {errors.linkedin.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Instagram URL
                </label>
                <input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/yourprofile"
                  className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  {...register('instagram')}
                />
                {errors.instagram && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {errors.instagram.message}
                  </p>
                )}
              </div>
            </div>

            {/* Skills Section (Developer only) */}
            {isDeveloper && (
              <div className="space-y-5 p-6 rounded-xl bg-blue-50 dark:bg-slate-700/30 border border-blue-200/50 dark:border-slate-600/50">
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                  Skills
                </h3>

                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-4">
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
                              'px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
                              field.value?.includes(skill)
                                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/30'
                                : 'border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-slate-500 hover:bg-blue-50 dark:hover:bg-slate-700/80'
                            )}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>

                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-slate-700/40 rounded-lg border border-blue-200/50 dark:border-slate-600/50">
                          {field.value.map((skill) => (
                            <div
                              key={skill}
                              className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((s) => s !== skill)
                                  )
                                }}
                                className="hover:opacity-80 transition-opacity"
                              >
                                <X className="w-3.5 h-3.5" />
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/40 transition-all hover:shadow-xl hover:shadow-blue-600/50 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none active:scale-95"
            >
              {isSubmitting || updateProfileMutation.isPending ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving changes...
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
