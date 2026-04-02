// Mobile Responsive Utilities and Components

/**
 * Responsive Breakpoints
 * Mobile: < 640px (sm)
 * Tablet: 640px - 1024px (md)
 * Desktop: > 1024px (lg)
 */

export const breakpoints = {
  sm: '640px', // Mobile
  md: '768px', // Tablet
  lg: '1024px', // Desktop
  xl: '1280px', // Large Desktop
}

/**
 * Touch-friendly sizes for mobile
 * WCAG recommends minimum 44x44px touch targets
 */
export const touchSizes = {
  xs: '32px', // Small touch target
  sm: '40px', // Minimum recommended
  md: '48px', // Comfortable
  lg: '56px', // Large
}

/**
 * Mobile-optimized spacing
 * Larger padding on mobile for easier tapping
 */
export const mobileSpacing = {
  compact: 'p-2 md:p-3 lg:p-4',
  normal: 'p-3 md:p-4 lg:p-6',
  comfortable: 'p-4 md:p-6 lg:p-8',
}

/**
 * Mobile-first responsive utilities
 */
export const responsive = {
  // Font sizes
  text: {
    xs: 'text-xs md:text-xs lg:text-xs',
    sm: 'text-sm md:text-sm lg:text-sm',
    base: 'text-base md:text-base lg:text-base',
    lg: 'text-lg md:text-lg lg:text-lg',
    xl: 'text-xl md:text-2xl lg:text-3xl',
  },

  // Grid columns
  grid: {
    2: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },

  // Padding
  padding: {
    normal: 'px-3 md:px-4 lg:px-6 py-3 md:py-4 lg:py-6',
    comfortable: 'px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8',
  },

  // Width constraints
  container: 'w-full md:w-3/4 lg:w-1/2',
}

/**
 * Common mobile-responsive patterns
 */
export const mobilePatterns = {
  // Hide on mobile, show on desktop
  desktopOnly: 'hidden md:flex lg:flex',
  tabletUp: 'hidden md:flex',

  // Show on mobile, hide on desktop
  mobileOnly: 'md:hidden lg:hidden',

  // Full width on mobile, constrained on desktop
  fullToContainer: 'w-full md:w-3/4 lg:w-1/2 mx-auto',

  // Single column on mobile, grid on desktop
  flexToGrid: 'flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3',

  // Stacked on mobile, horizontal on desktop
  stackedToRow: 'flex flex-col md:flex-row gap-3 md:gap-4 lg:gap-6',
}

/**
 * Mobile sheet styles (like bottom sheet on mobile)
 */
export const mobileSheet = {
  container: 'fixed inset-0 z-40 md:z-50 md:static md:inset-auto',
  backdrop: 'fixed inset-0 bg-black/50 md:hidden',
  content: 'fixed bottom-0 left-0 right-0 md:static md:inset-auto md:rounded-none rounded-t-2xl bg-white dark:bg-surface max-h-screen md:max-h-none overflow-y-auto md:overflow-visible',
}

/**
 * Mobile-optimized button sizes
 */
export const mobileButton = {
  sm: 'px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm',
  md: 'px-4 py-2 md:px-4 md:py-2 text-sm md:text-base',
  lg: 'px-4 py-3 md:px-6 md:py-3 text-base md:text-lg min-h-[44px] md:min-h-[40px]',
}

/**
 * Safe area insets (for notched devices)
 * Usage: p-safe (will use safe-area-inset-left, etc.)
 */
export const safeAreaInsets = {
  container: 'p-safe',
  top: 'pt-safe',
  bottom: 'pb-safe',
  left: 'pl-safe',
  right: 'pr-safe',
}

/**
 * Mobile-optimized form inputs
 */
export const mobileInput = {
  base: 'w-full px-3 md:px-4 py-2 md:py-2 text-sm md:text-base rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[44px] md:min-h-auto',
  compact: 'px-2 md:px-3 py-2 text-sm min-h-[40px] md:min-h-auto',
}

/**
 * Mobile performance: Disable animations on low-power devices
 */
export const prefersReducedMotion = {
  animation: 'motion-safe:animate-fadeIn motion-reduce:opacity-100',
  transition: 'motion-safe:transition-all motion-reduce:transition-none',
}

/**
 * Orientation-specific styles
 */
export const orientation = {
  portrait: 'portrait:flex landscape:hidden',
  landscape: 'landscape:flex portrait:hidden',
}

/**
 * Touch device detection class
 * Apply to html element: className="touch-device"
 */
export const touchDeviceStyles = `
  @media (hover: none) and (pointer: coarse) {
    button { min-height: 44px; }
    input { min-height: 44px; }
    a { min-height: 44px; display: inline-flex; align-items: center; }
  }
`

export default {
  breakpoints,
  touchSizes,
  mobileSpacing,
  responsive,
  mobilePatterns,
  mobileSheet,
  mobileButton,
  safeAreaInsets,
  mobileInput,
  prefersReducedMotion,
  orientation,
}
