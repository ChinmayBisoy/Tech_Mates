import toast from 'react-hot-toast'

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      ...options,
    })
  },

  error: (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      ...options,
    })
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options,
    })
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      {
        position: 'top-right',
        ...options,
      }
    )
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId)
  },

  custom: (element, options = {}) => {
    toast.custom(element, {
      position: 'top-right',
      ...options,
    })
  },

  // Specific use cases
  subscriptionSuccess: () => {
    showToast.success('Subscription activated! Redirecting...', { duration: 2000 })
  },

  projectPosted: () => {
    showToast.success('Project posted successfully! 🚀')
  },

  profileUpdated: () => {
    showToast.success('Profile updated successfully!')
  },

  paymentSuccess: () => {
    showToast.success('Payment processed successfully!')
  },

  copyToClipboard: () => {
    showToast.success('Copied to clipboard!')
  },

  networkError: () => {
    showToast.error('Network error. Please check your connection.')
  },

  fieldRequired: (fieldName) => {
    showToast.error(`${fieldName} is required`)
  },
}

export default showToast
