import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function LoginForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const response = await authAPI.login(data)

      if (response.success) {
        const { user, token, refreshToken } = response
        setAuth(user, token, refreshToken)
        toast.success('Logged in successfully!')
        reset()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.message || 'Login failed')
      }
    } catch (error) {
      // Handle backend validation errors
      const errorData = error.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Show first validation error
        const firstError = errorData.errors[0]
        toast.error(firstError.message || errorData.message || 'Login failed')
      } else {
        const message = errorData?.message || error.message || 'Login failed'
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
          <p className="text-danger text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Password
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
          <p className="text-danger text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <a
          href="/forgot-password"
          className="text-sm text-primary-600 dark:text-accent hover:text-primary-700 dark:hover:text-accent-400 transition-colors"
        >
          Forgot password?
        </a>
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
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Sign Up Link */}
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
        Don't have an account?{' '}
        <a
          href="/register"
          className="text-primary-600 dark:text-accent hover:text-primary-700 dark:hover:text-accent-400 font-medium transition-colors"
        >
          Sign up
        </a>
      </p>
    </form>
  )
}
