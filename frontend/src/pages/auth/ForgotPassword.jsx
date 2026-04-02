import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '@/api/auth.api'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export function ForgotPassword() {
  const navigate = useNavigate()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const email = watch('email')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const response = await authAPI.forgotPassword(data.email)

      if (response.success) {
        setIsSubmitted(true)
        toast.success('Check your email for reset instructions')
      } else {
        toast.error(response.message || 'Something went wrong')
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to send reset email. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-base flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reset your password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="w-16 h-16 text-success" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email sent!
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Check your email at <span className="font-medium">{email}</span>{' '}
                for a link to reset your password. The link expires in 1 hour.
              </p>

              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Didn't receive the email?
                </p>

                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full btn btn-secondary"
                >
                  Try another email
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn btn-primary"
                >
                  Back to login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-danger text-sm mt-1">
                    {errors.email.message}
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
                    Sending...
                  </>
                ) : (
                  'Send reset link'
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
