import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Trash2, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'

const evidenceSchema = z.object({
  type: z.enum(['message', 'screenshot', 'document', 'email', 'other'], {
    errorMap: () => ({ message: 'Please select evidence type' }),
  }),
  content: z.string().min(10, 'Evidence description must be at least 10 characters'),
})

export function EvidenceForm({ onSubmit, isSubmitting }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(evidenceSchema),
  })

  const [selectedFiles, setSelectedFiles] = useState([])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data) => {
    const formData = {
      ...data,
      files: selectedFiles,
    }
    await onSubmit(formData)
    reset()
    setSelectedFiles([])
  }

  const evidenceTypes = [
    { value: 'message', label: '💬 Message/Chat Log', icon: '💬' },
    { value: 'screenshot', label: '📸 Screenshot', icon: '📸' },
    { value: 'document', label: '📄 Document', icon: '📄' },
    { value: 'email', label: '📧 Email', icon: '📧' },
    { value: 'other', label: '📎 Other', icon: '📎' },
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white dark:bg-surface rounded-lg border-2 border-blue-500 p-6 space-y-4">
      {/* Header */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Submit Evidence</h3>

      {/* Evidence Type */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          Evidence Type
        </label>
        <select
          {...register('type')}
          className={cn(
            'w-full px-4 py-2 border-2 rounded-lg transition-all',
            'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
            'focus:outline-none focus:border-blue-500 dark:focus:border-blue-400',
            errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          )}
        >
          <option value="">Select evidence type...</option>
          {evidenceTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
        )}
      </div>

      {/* Evidence Description */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          Description
        </label>
        <textarea
          {...register('content')}
          placeholder="Describe your evidence in detail..."
          rows="4"
          className={cn(
            'w-full px-4 py-2 border-2 rounded-lg transition-all',
            'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
            'focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none',
            errors.content ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          )}
        />
        {errors.content && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
        )}
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Minimum 10 characters required
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white">
          Attach Files (Optional)
        </label>

        {/* Upload Area */}
        <div className="relative border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-4 text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Max 5 files, 10MB each
          </p>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Selected Files ({selectedFiles.length})
            </p>
            <div className="space-y-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white dark:bg-surface p-2 rounded border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">📎</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-400 space-y-1">
        <p className="font-semibold">💡 Tips for strong evidence:</p>
        <ul className="text-xs space-y-0.5 ml-4">
          <li>✓ Be specific and factual</li>
          <li>✓ Include timestamps and dates</li>
          <li>✓ Screenshots should be clear and complete</li>
          <li>✓ Provide context for messages or emails</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wide',
          isSubmitting
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
        )}
      >
        {isSubmitting ? '⏳ Submitting...' : '📤 Submit Evidence'}
      </button>
    </form>
  )
}
