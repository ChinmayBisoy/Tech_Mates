import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Camera, Loader, CheckCircle2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { userAPI } from '@/api/user.api'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'
import { SKILLS } from '@/utils/constants'
import { cn } from '@/utils/cn'

const createProfileSetupSchema = (isDeveloper) =>
  z.object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-z0-9._]+$/, 'Use lowercase letters, numbers, dots, or underscores only'),
    bio: z
      .string()
      .trim()
      .min(20, 'Bio must be at least 20 characters')
      .max(500, 'Bio must be at most 500 characters'),
    skills: isDeveloper
      ? z.array(z.string()).min(1, 'Select at least one skill')
      : z.array(z.string()).optional().default([]),
    linkedin: z.string().url('LinkedIn URL must be valid').optional().or(z.literal('')),
    instagram: z.string().url('Instagram URL must be valid').optional().or(z.literal('')),
  })

export default function ProfileSetup() {
  const navigate = useNavigate()
  const { user, isProfileComplete, isDeveloper } = useAuth()
  const { updateUser } = useAuthStore()
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [customSkillInput, setCustomSkillInput] = useState('')
  const [customSkills, setCustomSkills] = useState([])
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false)

  const defaults = useMemo(
    () => ({
      username: user?.username || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      linkedin: user?.linkedin || '',
      instagram: user?.instagram || '',
    }),
    [user]
  )

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createProfileSetupSchema(isDeveloper)),
    values: defaults,
  })

  const completeMutation = useMutation({
    mutationFn: async (formValues) => {
      const profileData = {
        username: formValues.username,
        bio: formValues.bio,
        linkedin: formValues.linkedin || undefined,
        instagram: formValues.instagram || undefined,
      }

      // Only include skills for developers, combining preset skills with custom skills
      if (isDeveloper) {
        const allSkills = [...(formValues.skills || []), ...customSkills]
        if (allSkills.length === 0) {
          throw new Error('Please select at least one skill')
        }
        profileData.skills = allSkills
      }

      const updatedProfile = await userAPI.updateProfile(profileData)

      let avatarUrl = user?.avatar || ''
      if (avatarFile) {
        const avatarResponse = await userAPI.uploadAvatar(avatarFile)
        avatarUrl = avatarResponse?.avatarUrl || avatarUrl
      }

      return {
        ...updatedProfile,
        avatar: avatarUrl,
        isProfileComplete: true,
      }
    },
    onSuccess: (profile) => {
      updateUser(profile)
      toast.success('Profile completed successfully')
      navigate('/dashboard', { replace: true })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || 'Failed to complete profile setup')
    },
  })

  const onAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar must be less than 5MB')
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) {
      toast.error('Please enter a skill name')
      return
    }
    
    if (customSkills.includes(customSkillInput.trim())) {
      toast.error('This skill is already added')
      return
    }

    setCustomSkills([...customSkills, customSkillInput.trim()])
    setCustomSkillInput('')
  }

  const handleRemoveCustomSkill = (skill) => {
    setCustomSkills(customSkills.filter((s) => s !== skill))
  }

  if (!user) {
    return null
  }

  if (isProfileComplete) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50/50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-blue-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.3)]">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-700/50 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 dark:text-blue-400">
            Complete Your Profile
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 dark:text-white">Set up your public profile</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Add your username, bio, skills, and avatar so your profile feels real and trustworthy.
          </p>
        </div>

        <form
          onSubmit={handleSubmit((values) => completeMutation.mutate(values))}
          className="space-y-7"
        >
          {/* Avatar Section */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700/40 dark:to-slate-700/30 border border-blue-200/50 dark:border-slate-600/50 p-6">
            <div className="flex items-center gap-6">
              <div>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-24 w-24 rounded-2xl object-cover ring-4 ring-blue-200 dark:ring-blue-700" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 ring-4 ring-blue-200 dark:ring-blue-700">
                    <Camera className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Profile Picture</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">Upload a professional photo (max 5MB)</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-700/50 bg-white dark:bg-slate-700 px-4 py-2.5 font-semibold text-blue-700 dark:text-blue-400 transition-all hover:bg-blue-50 dark:hover:bg-slate-700/80">
                  <Camera className="h-4 w-4" />
                  Choose Avatar
                  <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                </label>
              </div>
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
              Username
            </label>
            <input 
              id="username" 
              className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" 
              placeholder="johndev" 
              {...register('username')} 
            />
            {errors.username && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.username.message}</p>}
          </div>

          {/* Bio Textarea */}
          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
              Bio
            </label>
            <textarea 
              id="bio" 
              rows={4} 
              className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none transition-all" 
              placeholder="Tell people what you build and what you are great at..." 
              {...register('bio')} 
            />
            {errors.bio && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>}
          </div>

          {isDeveloper && (
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-900 dark:text-white">Skills</label>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {SKILLS.filter((skill) => skill !== 'Other').map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            const hasSkill = field.value?.includes(skill)
                            const next = hasSkill
                              ? field.value.filter((item) => item !== skill)
                              : [...(field.value || []), skill]
                            field.onChange(next)
                          }}
                          className={cn(
                            'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                            field.value?.includes(skill)
                              ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/30'
                              : 'border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-slate-500 hover:bg-blue-50 dark:hover:bg-slate-700/80'
                          )}
                        >
                          {skill}
                        </button>
                      ))}
                      
                      {/* Custom Skills Button */}
                      <button
                        type="button"
                        onClick={() => setShowCustomSkillInput(!showCustomSkillInput)}
                        className={cn(
                          'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-200',
                          showCustomSkillInput || customSkills.length > 0
                            ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-500/30'
                            : 'border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-slate-500 hover:bg-blue-50 dark:hover:bg-slate-700/80'
                        )}
                      >
                        + Add Custom Skill
                      </button>
                    </div>

                    {/* Custom Skill Input */}
                    {showCustomSkillInput && (
                      <div className="mb-4 flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter a skill (e.g., Rust, Solidity, etc.)"
                          value={customSkillInput}
                          onChange={(e) => setCustomSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddCustomSkill()
                            }
                          }}
                          className="flex-1 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomSkill}
                          className="rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 text-white px-5 py-2 font-semibold hover:shadow-md hover:shadow-blue-500/30 transition-all active:scale-95"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* All Selected Skills Display */}
                    {(field.value?.length > 0 || customSkills.length > 0) && (
                      <div className="flex flex-wrap gap-2 p-4 bg-blue-50 dark:bg-slate-700/30 rounded-lg border border-blue-200/50 dark:border-slate-600/50">
                        {field.value?.map((skill) => (
                          <div
                            key={skill}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </div>
                        ))}
                        {customSkills.map((skill) => (
                          <div
                            key={skill}
                            className="inline-flex items-center gap-2 bg-sky-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomSkill(skill)}
                              className="hover:opacity-80 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.skills && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.skills.message}</p>}
                  </div>
                )}
              />
            </div>
          )}

          {/* Social Links */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="linkedin" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                LinkedIn URL <span className="text-slate-500 dark:text-slate-400 font-normal">(optional)</span>
              </label>
              <input 
                id="linkedin" 
                className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" 
                placeholder="https://linkedin.com/in/username" 
                {...register('linkedin')} 
              />
              {errors.linkedin && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.linkedin.message}</p>}
            </div>

            <div>
              <label htmlFor="instagram" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                Instagram URL <span className="text-slate-500 dark:text-slate-400 font-normal">(optional)</span>
              </label>
              <input 
                id="instagram" 
                className="w-full rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all" 
                placeholder="https://instagram.com/username" 
                {...register('instagram')} 
              />
              {errors.instagram && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.instagram.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || completeMutation.isPending || (!avatarFile && !user?.avatar)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/40 transition-all hover:shadow-xl hover:shadow-blue-600/50 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:shadow-none active:scale-95"
          >
            {isSubmitting || completeMutation.isPending ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Saving profile...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Complete Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
