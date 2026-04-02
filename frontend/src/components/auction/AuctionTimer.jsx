import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'

export function AuctionTimer({ endsAt, onTimeUp }) {
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = new Date(endsAt).getTime() - Date.now()
      if (remaining <= 0) {
        setTimeRemaining(0)
        onTimeUp?.()
      } else {
        setTimeRemaining(remaining)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [endsAt, onTimeUp])

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60)
  const seconds = Math.floor((timeRemaining / 1000) % 60)

  const isEnding = timeRemaining < 60 * 60 * 1000 // Less than 1 hour
  const isUrjent = timeRemaining < 5 * 60 * 1000 // Less than 5 minutes
  const isExpired = timeRemaining === 0

  const formatUnit = (value) => String(value).padStart(2, '0')

  if (isExpired) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">AUCTION ENDED</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">00:00:00</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg p-4 text-center transition-all duration-300',
        isUrjent
          ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500 animate-pulse'
          : isEnding
            ? 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-500'
            : 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
      )}
    >
      <p
        className={cn(
          'text-sm font-semibold uppercase tracking-widest',
          isUrjent
            ? 'text-red-700 dark:text-red-400'
            : isEnding
              ? 'text-yellow-700 dark:text-yellow-400'
              : 'text-green-700 dark:text-green-400'
        )}
      >
        {isUrjent ? '🔴 Ending Very Soon!' : isEnding ? '🟡 Ending Soon' : '🟢 Time Remaining'}
      </p>

      {/* Timer Display */}
      <div className="mt-3 space-y-2">
        <div className="flex justify-center gap-2 text-center">
          {days > 0 && (
            <div>
              <div className="bg-gray-900 dark:bg-gray-700 text-white rounded px-2 py-1 min-w-12">
                <span className="text-xl font-bold">{formatUnit(days)}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Days</p>
            </div>
          )}

          <div>
            <div className="bg-gray-900 dark:bg-gray-700 text-white rounded px-2 py-1 min-w-12">
              <span className="text-xl font-bold">{formatUnit(hours)}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hours</p>
          </div>

          <div>
            <div className="bg-gray-900 dark:bg-gray-700 text-white rounded px-2 py-1 min-w-12">
              <span className="text-xl font-bold">{formatUnit(minutes)}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Mins</p>
          </div>

          <div>
            <div
              className={cn(
                'rounded px-2 py-1 min-w-12 font-bold text-xl',
                isUrjent
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-gray-900 dark:bg-gray-700 text-white'
              )}
            >
              <span>{formatUnit(seconds)}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Secs</p>
          </div>
        </div>

        {/* Compact Display */}
        <div
          className={cn(
            'text-center font-bold tracking-wider pt-2',
            isUrjent
              ? 'text-red-700 dark:text-red-400 text-lg animate-pulse'
              : isEnding
                ? 'text-yellow-700 dark:text-yellow-400 text-lg'
                : 'text-green-700 dark:text-green-400'
          )}
        >
          {days > 0
            ? `${days}d ${hours}h ${minutes}m`
            : `${hours}h ${minutes}m ${seconds}s`}
        </div>
      </div>

      {/* Status Message */}
      {isUrjent && (
        <p className="text-xs text-red-700 dark:text-red-400 font-semibold mt-3 animate-pulse">
          ⚠️ Place your bid now before it's too late!
        </p>
      )}
    </div>
  )
}
