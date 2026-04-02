import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export function RoleSelector({ value, onChange }) {
  const roles = [
    {
      id: 'user',
      title: 'I need a developer',
      description: 'Post projects and hire developers',
      icon: '💼',
    },
    {
      id: 'developer',
      title: 'I am a developer',
      description: 'Browse jobs and sell your work',
      icon: '👨‍💻',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {roles.map((role) => (
        <button
          key={role.id}
          onClick={() => onChange(role.id)}
          className={cn(
            'group relative overflow-hidden rounded-2xl border-2 p-8 text-left transition-all duration-300 hover:-translate-y-1',
            value === role.id
              ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-accent-50 shadow-lg shadow-primary-100/70 dark:from-primary-900/30 dark:to-accent-900/10'
              : 'border-gray-200 bg-white hover:border-primary-400 hover:shadow-md dark:border-gray-700 dark:bg-base dark:hover:border-primary-500'
          )}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-100/80 blur-2xl dark:bg-primary-800/20" />

          {/* Checkmark */}
          {value === role.id && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Icon */}
          <div className="text-4xl mb-4">{role.icon}</div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {role.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {role.description}
          </p>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-primary-700 dark:text-accent">
            {value === role.id ? 'Selected' : 'Choose this role'}
          </p>
        </button>
      ))}
    </div>
  )
}
