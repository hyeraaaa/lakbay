import { useEffect, useRef } from 'react'

/**
 * Hook to preserve scroll position when filters change
 * Only preserves scroll after initial load is complete
 */
export function useScrollPreservation(
  isLoading: boolean,
  hasInitialLoadCompleted: boolean,
  dependencies: unknown[]
) {
  const scrollPositionRef = useRef<number>(0)

  // Save scroll position when dependencies change (after initial load)
  useEffect(() => {
    if (hasInitialLoadCompleted) {
      scrollPositionRef.current = window.scrollY
    }
  }, dependencies)

  // Restore scroll position after data loads (only after initial load)
  useEffect(() => {
    if (hasInitialLoadCompleted && !isLoading && scrollPositionRef.current > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'instant' as ScrollBehavior
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isLoading, hasInitialLoadCompleted])

  return scrollPositionRef
}

