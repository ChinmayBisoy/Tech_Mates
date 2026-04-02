import { useState } from 'react'
import { cn } from '@/utils/cn'

export function Tabs({ defaultValue, children, className }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className={className}>
      {children({ activeTab, setActiveTab })}
    </div>
  )
}

export function TabsList({ children, className }) {
  return (
    <div className={cn('flex border-b border-slate-200 dark:border-slate-700', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, onClick, className, ...props }) {
  return (
    <button
      onClick={() => onClick?.(value)}
      className={cn(
        'px-4 py-2 font-medium transition-colors border-b-2 border-transparent',
        'hover:text-blue-600 dark:hover:text-blue-400',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  return (
    <div className={cn('py-6', className)}>
      {children}
    </div>
  )
}
