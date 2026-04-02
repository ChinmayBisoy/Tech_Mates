import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, EyeOff, Loader, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '@/api/auth.api'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid reset link')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authAPI.resetPassword(token, data.password)

      if (response.success) {
        setIsSuccess(true)
        toast.success('Password reset successfully!')
      } else {
        toast.error(response.message || 'Failed to reset password')
      }
    } catch (error) {
      const message = error.response?.data?.message
      if (message?.includes('expired')) {
        toast.error('Reset link has expired. Please request a new one.')
      } else {
        toast.error(message || 'Failed to reset password')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-white dark:bg-base flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid link
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="btn btn-primary"
          >
            Request new reset link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create new password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a new password for your account
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="w-16 h-16 text-success" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Password reset!
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your password has been reset successfully. You can now log in
                with your new password.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="w-full btn btn-primary"
              >
                Go to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-danger text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
                  Must contain: uppercase letter, number, 8+ characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-danger text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset password'
                )}
              </button>

              {/* Back to Login Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-primary-600 dark:text-accent hover:text-primary-700 dark:hover:text-accent-400 font-medium transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-600 dark:text-gray-400 text-xs mt-6">
          By resetting your password, you agree to our Terms of Service and
          Privacy Policy
        </p>
      </div>
    </div>
  )
}
