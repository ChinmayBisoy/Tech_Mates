import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function RegisterForm({ role, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Convert 'user' to 'client' for backend
      const backendRole = role === 'user' ? 'client' : role
      
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: backendRole,
      }

      const response = await authAPI.register(registerData)

      if (response.success) {
        const { user, token, refreshToken } = response
        setAuth(user, token, refreshToken)
        toast.success('Account created successfully!')
        reset()
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.message || 'Registration failed')
      }
    } catch (error) {
      // Handle backend validation errors
      const errorData = error.response?.data
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Show first validation error
        const firstError = errorData.errors[0]
        toast.error(firstError.message || errorData.message || 'Registration failed')
      } else {
        const message = errorData?.message || error.message || 'Registration failed'
        toast.error(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="John Doe"
          className="input"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-danger text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

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
        <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">
          Must contain: uppercase letter, number, special character (@$!%*?&), 8+ characters
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Sign In Link */}
      <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-primary-600 dark:text-accent hover:text-primary-700 dark:hover:text-accent-400 font-medium transition-colors"
        >
          Sign in
        </a>
      </p>
    </form>
  )
}
